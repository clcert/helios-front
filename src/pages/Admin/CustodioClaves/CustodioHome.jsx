import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import ImageFooter from "../../../component/Footers/ImageFooter";
import LoadPage from "../../../component/Loading/LoadPage";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import { backendOpIP } from "../../../server";
import { getTrusteeCrypto } from "../../../services/trustee";
import imageTrustees from "../../../static/svg/trustees1.svg";
import NoAuth from "../../Booth/NoAuth";
import StepButton from "./components/StepButton";
import SmallStepButton from "./components/SmallStepButton";

function CustodioHome(props) {
  const [trustee, setTrustee] = useState([]);
  const [trusteeCrypto, setTrusteeCrypto] = useState([]);
  const [election, setElection] = useState([]);
  const [load, setLoad] = useState(false);
  const [auth, setAuth] = useState(false);
  const [noAuthMessage, setNoAuthMessage] = useState("");

  /** @state {bool}  */
  const [searchParams] = useSearchParams();

  const { shortName, uuidTrustee } = useParams();

  const disabledButton1 = Boolean(
    !trusteeCrypto.public_key ||
      (trusteeCrypto.current_step >= 0 && trusteeCrypto.current_step < 3)
      ? false
      : true
  );

  const disabledButton2 = Boolean(trusteeCrypto.public_key ? false : true);

  const disabledButton3 = Boolean(
    trusteeCrypto.current_step === 4 &&
      election.status === "Tally computed" &&
      trusteeCrypto.decryptions === null
      ? false
      : true
  );

  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      window.location.href = backendOpIP + "/" + shortName + "/trustee/login";
    }
    getTrusteeCrypto(shortName, uuidTrustee).then((data) => {
      try {
        const { resp, jsonResponse } = data;
        const typeErrors = {
          "Election status check failed": "La elección se encuentra cerrada",
          "Election not found": "La elección no existe",
          "Trustee not found":
            "No estas habilitado para generar llaves en esta elección",
        };

        setLoad(true);
        if (resp.status === 200) {
          setAuth(true);
          setTrustee(jsonResponse.trustee);
          setTrusteeCrypto(jsonResponse.trustee_crypto);
          setElection(jsonResponse.election);
        } else {
          const message =
            jsonResponse.detail in typeErrors
              ? typeErrors[jsonResponse.detail]
              : "No tienes permisos para ver ese contenido";

          setNoAuthMessage(message);
        }
      } catch (err) {
        setLoad(true);
        setNoAuthMessage(
          "No estas habilitado para generar llaves en esta elección"
        );
      }
    });
  }, [searchParams, shortName, uuidTrustee]);

  if (!load) {
    return <LoadPage />;
  }

  if (!auth) {
    return (
      <NoAuth
        title={"Custodio de Claves"}
        message={noAuthMessage}
        addressLogout={`${backendOpIP}/${shortName}/trustee/logout`}
      />
    );
  } else {
    return (
      <div id="content-home-admin">
        <section id="header-section" className="parallax hero is-medium">
          <div className="hero-body pt-0 px-0 header-hero">
            <MyNavbar
              linkExit={`${backendOpIP}/${shortName}/trustee/logout`}
              linkInit={"/" + shortName + "/trustee/" + uuidTrustee + "/home"}
            />
            <TitlePsifos
              namePage="Portal de Custodio de Clave"
              nameElection={election.name}
            />
          </div>
        </section>

        <section className="section" id="medium-section">
          <div className="container has-text-centered is-max-desktop">
            <div>
              {load ? (
                <>
                  <div className="is-flex is-flex-direction-column is-align-items-center">
                    {!disabledButton1 && (
                      <div>
                        <p className="has-text-white is-size-4">
                          La Generación Claves se divide en dos pasos: el
                          primero será generar y descargar su clave privada.
                          Luego, vendrá el proceso de sincronización con el
                          resto de los Custodios de Clave.
                        </p>
                        <StepButton
                          id="init-key-generator"
                          text="Iniciar Generación de Claves"
                          linkTo={
                            "/psifos/" +
                            shortName +
                            "/trustee/" +
                            uuidTrustee +
                            "/keygenerator"
                          }
                        />
                      </div>
                    )}
                    {!disabledButton2 && disabledButton3 && (
                      <div>
                        <p className="has-text-white is-size-4">
                          En cualquier momento Ud. puede verificar que su Clave
                          Privada está correctamente almacenada en su computador
                          y en su respaldo correspondiente
                        </p>
                        <StepButton
                          id="verify-key"
                          text="Verificar Clave Privada"
                          linkTo={
                            "/psifos/" +
                            shortName +
                            "/trustee/" +
                            uuidTrustee +
                            "/check-sk"
                          }
                        />
                      </div>
                    )}
                    {!disabledButton2 && !disabledButton3 && (
                      <SmallStepButton
                        text="Verificar Clave Privada"
                        linkTo={
                          "/psifos/" +
                          shortName +
                          "/trustee/" +
                          uuidTrustee +
                          "/check-sk"
                        }
                      />
                    )}
                    {!disabledButton3 && (
                      <div>
                        <p className="has-text-white is-size-4">
                          La elección ha finalizado y Ud. debe enviar su
                          Desencriptación Parcial. Para ello debe subir el
                          archivo con su Clave Privada que está almacenado en su
                          computador y respaldado
                        </p>
                        <StepButton
                          id="upload-key"
                          text="Enviar Desencriptación Parcial"
                          linkTo={
                            "/psifos/" +
                            shortName +
                            "/trustee/" +
                            uuidTrustee +
                            "/decrypt-and-prove"
                          }
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="spinner-animation-white"></div>
              )}
            </div>
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

export default CustodioHome;
