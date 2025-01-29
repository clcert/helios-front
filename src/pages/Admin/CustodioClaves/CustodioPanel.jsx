import { useCallback, useEffect, useState } from "react";
import { getTrusteePanel } from "../../../services/trustee";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import ImageFooter from "../../../component/Footers/ImageFooter";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import imageTrustees from "../../../static/svg/trustees1.svg";
import LoadPage from "../../../component/Loading/LoadPage";
import NoAuth from "../../Booth/NoAuth";
import KeyGenerator from "../../../crypto/KeyGenerator";
import DropFile from "./components/DropFile";
import CheckSecretKey from "../../../crypto/CheckSecretKey";
import DecryptAndProve from "../../../crypto/DecryptAndProve";
import Tabs from "../component/Tabs";
import { electionStatus, trusteeStep } from "../../../constants";

const getTrusteeStatus = (crypto) => {
  if (crypto.status === electionStatus.settingUp) {
    return "Elección en configuración";
  }
  if (crypto.decryptions) {
    return "Desencriptaciones enviadas";
  }
  if (crypto.public_key) {
    return "Llave generada";
  }
  return "Llaves aun no generadas";
};

function CustodioSelector({
  trusteeCrypto,
  index,
  setElectionsSelected,
  isDisabled,
}) {
  const handlerSelector = (e) => {
    setElectionsSelected((prev) => [...prev, e.target.value]);
  };

  return (
    <div className="box border-style-box my-4 p-2" key={index}>
      <input
        type="checkbox"
        onChange={handlerSelector}
        disabled={isDisabled}
        value={trusteeCrypto.election_short_name}
      />
      <h1>{trusteeCrypto.election_short_name}</h1>
      <p>{getTrusteeStatus(trusteeCrypto)}</p>
    </div>
  );
}

function ElectionDisplay({ trusteeCrypto }) {
  return (
    <div className="box border-style-box my-4 p-2">
      <p>{getTrusteeStatus(trusteeCrypto)}</p>
      <h1>{trusteeCrypto.election_short_name}</h1>
    </div>
  );
}

function NoElectionDisplay() {
  return (
    <div className="box border-style-box my-4 p-2 py-4">
      <h1>No hay elecciones disponibles</h1>
    </div>
  );
}

function ButtonAction({ text, onClick, disabled }) {
  return (
    <button
      className="button-custom home-admin-button is-size-7-mobile button ml-2"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

function SynchronizeSection({
  cryptoGenerateKey,
  setCryptoGenerateKey,
  initPanel,
}) {
  const [electionsSelected, setElectionsSelected] = useState([]);
  const [electionsCrypto, setElectionsCrypto] = useState([]);
  const [initSynchronizeReady, setInitSynchronizeReady] = useState(false);
  const [feedback, setFeedback] = useState([]);

  const setSteps = (index, value) => {
    setFeedback((prev) => {
      const newFeedback = [...prev]; // Crear una nueva copia del estado anterior
      newFeedback[index] = value; // Actualizar la copia
      return newFeedback; // Retornar la nueva copia
    });
    if (value === "Generación de claves completada con éxito") {
      setCryptoGenerateKey((prev) => {
        const newCrypto = [...prev];
        newCrypto[index] = null;
        return newCrypto;
      });
    }
  };

  const prepareToSynchronize = async () => {
    const elections = [];
    setInitSynchronizeReady(true);
    electionsSelected.forEach(async (shortName, index) => {
      const key = new KeyGenerator(shortName, index, setSteps);
      await key.initParams();
      elections.push(key);
      if(index === electionsSelected.length - 1) {
        setElectionsCrypto(elections);
        setInitSynchronizeReady(false);
        setSteps(index, " - Eleccion preparadas para la generación");
      }
    });
  };

  const resetSync = () => {
    setElectionsCrypto([]);
  };

  const generateMultipleKeys = () => {
    const keys = [];
    var trusteeUsername = "";
    electionsCrypto.forEach((electionCrypto) => {
      if (trusteeUsername === "") {
        trusteeUsername = electionCrypto.trustee.username;
      }
      electionCrypto.generateKeyPair();
      keys.push({
        election_name: electionCrypto.shortName,
        secret_key: electionCrypto.getSecretKey(),
      });
      setSteps(electionCrypto.index, " - Clave generada");
    });
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + JSON.stringify(keys)
    );
    element.setAttribute("download", "LlavePrivada_" + trusteeUsername + ".key");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const synchronize = (secretKeyArray) => {
    electionsCrypto.forEach((electionCrypto) => {
      const secretKey = secretKeyArray.find(
        (secretKey) => secretKey.election_name === electionCrypto.shortName
      );
      electionCrypto.checkSk(secretKey.secret_key);
    });
  };
  return (
    <>
      <div className="mb-4">
        {cryptoGenerateKey.length > 0 && electionsCrypto.length === 0 && (
          <ButtonAction
            text="Seleccionar Elecciones"
            onClick={prepareToSynchronize}
            disabled={initSynchronizeReady}
          />
        )}
        {electionsCrypto.length > 0 && (
          <ButtonAction text="Volver" onClick={resetSync} />
        )}
          {electionsCrypto.length > 0 && (<button
            className="button-custom home-admin-button btn-fixed-mobile is-size-7-mobile button ml-2"
            onClick={generateMultipleKeys}
          >
            Generar claves
          </button>
        )}
      </div>

      {electionsCrypto.length > 0 && <DropFile setText={synchronize} />}
      <div className="my-4">
        {electionsCrypto.length > 0 && feedback.map((value, index) => {
          return (
            <div key={index}>
              <h3>
                {electionsCrypto[index].shortName} {value}
              </h3>
            </div>
          );
        })}
      </div>
      {initSynchronizeReady && (
        <div className="d-flex justify-content-center">
          <div className="spinner-animation" />
        </div>
      )}
      {cryptoGenerateKey.length > 0 ? (
        cryptoGenerateKey.map((trusteeCrypto, index) => {
          return (
            trusteeCrypto && (
              <CustodioSelector
                key={index}
                trusteeCrypto={trusteeCrypto}
                isDisabled={electionsCrypto.length > 0 || trusteeCrypto.current_step === trusteeStep.config_step}
                index={index}
                setElectionsSelected={setElectionsSelected}
                electionsSelected={electionsSelected}
              />
            )
          );
        })
      ) : (
        <NoElectionDisplay />
      )}
    </>
  );
}

function CheckSkSection({ cryptoCheckKey }) {
  const [electionsSelected, setElectionsSelected] = useState([]);
  const [electionsCrypto, setElectionsCrypto] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const prepareToCheckSk = () => {
    electionsSelected.forEach((shortName) => {
      const key = new CheckSecretKey(shortName);
      key.initParams();
      setElectionsCrypto((prev) => [...prev, key]);
    });
  };

  const resetCheckSk = () => {
    setElectionsCrypto([]);
  };

  const checkSk = (secretKeyArray) => {
    setFeedback([]);
    electionsCrypto.forEach((electionCrypto) => {
      const secretKey = secretKeyArray.find(
        (secretKey) => secretKey.election_name === electionCrypto.shortName
      );
      const message = `${electionCrypto.shortName}: ${electionCrypto.checkSk(secretKey.secret_key)}`;
      setFeedback((prev) => [...prev, message]);
    });
  };
  return (
    <>
      <div className="mb-4">
        {cryptoCheckKey.length > 0 && electionsCrypto.length === 0 && (
          <ButtonAction
            text="Seleccionar Elecciones"
            onClick={prepareToCheckSk}
          />
        )}
        {electionsCrypto.length > 0 && (
          <ButtonAction text="Volver" onClick={resetCheckSk} />
        )}
      </div>
      {electionsCrypto.length > 0 && <DropFile setText={checkSk} />}
      {feedback.length > 0 && (
        <div className="mt-4">
          {feedback.map((message, index) => {
            return <h3 key={index}>{message}</h3>;
          })}
        </div>
      )}
      {cryptoCheckKey.length > 0 ? (
        cryptoCheckKey.map((trusteeCrypto, index) => {
          return (
            <CustodioSelector
              key={index}
              trusteeCrypto={trusteeCrypto}
              isDisabled={electionsCrypto.length > 0}
              index={index}
              setElectionsSelected={setElectionsSelected}
            />
          );
        })
      ) : (
        <NoElectionDisplay />
      )}
    </>
  );
}

function DecryptProveSection({ cryptoDecryptProve }) {
  const [electionsSelected, setElectionsSelected] = useState([]);
  const [electionsCrypto, setElectionsCrypto] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const setFeedbacks = (index, value) => {
    setFeedback((prev) => {
      const newFeedback = [...prev]; // Crear una nueva copia del estado anterior
      newFeedback[index] = value; // Actualizar la copia
      return newFeedback; // Retornar la nueva copia
    });
  };

  const prepareToDecrypt = () => {
    electionsSelected.forEach((shortName, index) => {
      const key = new DecryptAndProve(shortName, index, setFeedbacks);
      setElectionsCrypto((prev) => [...prev, key]);
    });
  };

  const resetDecrypt = () => {
    setElectionsCrypto([]);
  };

  const decrypt = (secretKeyArray) => {
    electionsCrypto.forEach((electionCrypto) => {
      const secretKey = secretKeyArray.find(
        (secretKey) => secretKey.election_name === electionCrypto.shortName
      );
      electionCrypto.handlerDecrypt(secretKey.secret_key);
    });
  };
  return (
    <>
      <div className="mb-4">
        {cryptoDecryptProve.length > 0 && electionsCrypto.length === 0 && (
          <ButtonAction
            text="Seleccionar Elecciones"
            onClick={prepareToDecrypt}
          />
        )}
        {electionsCrypto.length > 0 && (
          <ButtonAction text="Volver" onClick={resetDecrypt} />
        )}
      </div>
      {electionsCrypto.length > 0 && <DropFile setText={decrypt} />}
      <div className="my-4">
        {feedback.map((value, index) => {
          return (
            <div key={index}>
              <h3>
                {electionsCrypto[index].shortName} {value}
              </h3>
            </div>
          );
        })}
      </div>  
      {cryptoDecryptProve.length > 0 ? (
        cryptoDecryptProve.map((trusteeCrypto, index) => {
          return (
            <CustodioSelector
              key={index}
              trusteeCrypto={trusteeCrypto}
              isDisabled={electionsCrypto.length > 0}
              index={index}
              setElectionsSelected={setElectionsSelected}
            />
          );
        })
      ) : (
        <NoElectionDisplay />
      )}
    </>
  );
}

export default function CustodioHome() {
  const [load, setLoad] = useState(false);
  const [trustee, setTrustee] = useState({});
  const [trusteesCrypto, setTrusteesCrypto] = useState([]);
  const [noAuthMessage, setNoAuthMessage] = useState("");
  const [auth, setAuth] = useState(false);

  const [actualTab, setActualTab] = useState(0);

  const [cryptoGenerateKey, setCryptoGenerateKey] = useState([]);
  const [cryptoCheckKey, setCryptoCheckKey] = useState([]);
  const [cryptoDecryptProve, setCryptoDecryptProve] = useState([]);

  const tabs = [
    "General",
    "Sincronización",
    "Chequear clave",
    "Desencriptación",
  ];

  const setCrypto = (trusteesCrypto) => {
    trusteesCrypto.forEach((trusteeCrypto) => {
      if (!trusteeCrypto.public_key) {
        setCryptoGenerateKey((prev) => [...prev, trusteeCrypto]);
      } else if (trusteeCrypto.public_key && !trusteeCrypto.decryptions) {
        setCryptoDecryptProve((prev) => [...prev, trusteeCrypto]);
      }
      if (trusteeCrypto.public_key) {
        setCryptoCheckKey((prev) => [...prev, trusteeCrypto]);
      }
    });
  };

  const initPanel = useCallback(() => {
    getTrusteePanel().then((data) => {
      try {
        const { resp, jsonResponse } = data;
        setLoad(true);
        if (resp.status === 200) {
          setAuth(true);
          setTrusteesCrypto(jsonResponse.trustee_crypto);
          setCrypto(jsonResponse.trustee_crypto);
          setTrustee(jsonResponse.trustee);
        } else {
          console.log("Error");
          setNoAuthMessage(jsonResponse.detail);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  useEffect(() => {
    initPanel();
  }, [initPanel]);

  if (!load) {
    return <LoadPage />;
  }

  if (!auth) {
    return <NoAuth title={"Custodio de Claves"} message={noAuthMessage} />;
  } else {
    return (
      <div id="content-home-admin">
        <section id="header-section" className="parallax hero is-medium">
          <div className="hero-body pt-0 px-0 header-hero">
            <MyNavbar />
            <TitlePsifos
              namePage="Portal de Custodio de Clave"
              nameElection={`Custodio ${trustee.name}`}
            />
          </div>
        </section>

        <section className="section voters-section">
          <div className="container has-text-centered is-max-desktop">
            <div className="d-flex ">
              <Tabs
                actualTab={actualTab}
                setActualTab={setActualTab}
                tabs={tabs}
              />
            </div>
            {actualTab === 1 && (
              <div>
                <SynchronizeSection
                  cryptoGenerateKey={cryptoGenerateKey}
                  setCryptoGenerateKey={setCryptoGenerateKey}
                  initPanel={initPanel}
                />
              </div>
            )}
            {actualTab === 2 && (
              <div>
                <CheckSkSection cryptoCheckKey={cryptoCheckKey} />
              </div>
            )}
            {actualTab === 3 && (
              <div>
                <DecryptProveSection cryptoDecryptProve={cryptoDecryptProve} />
              </div>
            )}
            {actualTab === 0 && (
              <div>
                {trusteesCrypto.map((trusteeCrypto, index) => {
                  return (
                    <ElectionDisplay
                      trusteeCrypto={trusteeCrypto}
                      key={index}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div>
          <ImageFooter imagePath={imageTrustees} />
          <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
        </div>
      </div>
    );
  }
}
