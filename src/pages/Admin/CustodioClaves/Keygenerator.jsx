import ImageFooter from "../../../component/Footers/ImageFooter";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import imageTrustees from "../../../static/svg/trustees1.svg";
import DropFile from "./components/DropFile";
import { Link, useParams } from "react-router-dom";
import { backendOpIP } from "../../../server";
import { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import KeyGenerator from "../../../crypto/KeyGenerator";

function Keygenerator(props) {
  const election = useSelector((state) => state.election.actualElection);

  /** @state Trustee   */

  /** @state {string} feedback button (init process) */
  const textButtonInit = "Iniciar proceso";

  /** @state {bool} enabled statefeedback button (generate keys) */
  const [enabledButtonInit, setEnabledButtonInit] = useState(false);

  /** @state {string} totally process feedback */
  const [processFeedback, setProcessFeedback] = useState("Cargando datos...");

  const [actualStep, setActualStep] = useState(0);

  const [actualPhase, setActualPhase] = useState(null);

  const [secretKey, setSecretKey] = useState(null);

  /** @urlParam {shortName} election shortName */
  const { shortName, uuidTrustee } = useParams();
  const key = useRef(
    new KeyGenerator(shortName, uuidTrustee, {
        setActualStep: setActualStep,
        setProcessFeedback: setProcessFeedback,
        setActualPhase: setActualPhase,
        setEnabledButtonInit: setEnabledButtonInit,
        setSecretKey: setSecretKey,
      },
    )
  );
  useEffect(() => {
    key.current.initParams();
  }, []);

  const step_0 = () => {
    key.current.step_0();
  };

  const checkSk = (secretKey) => {
    key.current.checkSk(secretKey);
  };

  const init_process = () => {
    key.current.initProcess();
  };

  const downloadKey = () => {
    key.current.downloadKey();
  };

  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <MyNavbar
            linkExit={`${backendOpIP}/${shortName}/trustee/logout`}
            linkInit={"/" + shortName + "/trustee/" + uuidTrustee + "/home"}
          />
          <TitlePsifos
            namePage="Portal de Custodio de Clave: Generación de Claves"
            nameElection={election.name} // TODO: Retrieve this value
          />
        </div>
      </section>

      <section className="section" id="medium-section">
        <div className="container has-text-centered is-max-desktop">
          {actualPhase === 1 && (
            <div className="level-item has-text-centered">
              <div>
                <p className="pb-2 title has-text-white">
                  1. Descarga de Clave Privada{" "}
                  <i
                    id="step_0"
                    className={
                      actualStep >= 1
                        ? "fa-solid fa-circle-check"
                        : "fa-solid fa-circle-xmark"
                    }
                  ></i>
                </p>
              </div>
            </div>
          )}
          {actualPhase === 2 && (
            <div>
              <p className="mb-1 title has-text-white">
                1. Descarga de Clave Privada{" "}
                <i id="step_0" className={"fa-solid fa-circle-check"}></i>
              </p>
              <p className="title has-text-white pb-2 mb-0">
                2. Sincronización con Custodios de Clave{" "}
                <i
                  id="step_1"
                  className={
                    actualStep >= 4
                      ? "fa-solid fa-circle-check"
                      : "fa-solid fa-spinner fa-spin"
                  }
                ></i>
              </p>
            </div>
          )}
          <div
            id="process_step"
            className="mt-3 has-text-black is-size-5 px-6 box"
          >
            <span>
              &nbsp;
              <i className="fa-solid fa-circle-info"></i>&nbsp;INFORMACIÓN
              <br />
              Se descargará un archivo que contiene su Clave Privada. Ese
              archivo lo debe almacenar en su computador y guardar un respaldo
              en otro dispositivo, por ejemplo, un pendrive.
            </span>
          </div>
          <p id="feedback-message" className="has-text-white is-size-4">
            {processFeedback}
          </p>
          {secretKey && actualPhase === 1 && <DropFile setText={checkSk} />}

          <div className="d-flex flex-column flex-sm-row justify-content-center">
            {!secretKey && actualPhase === 1 && (
              <button
                id="download-key"
                className="is-size-5-mobile  is-large button is-info is-light is-outlined"
                style={{
                  textDecoration: "None",
                  textTransform: "uppercase",
                  whiteSpace: "normal",
                  height: "3em",
                }}
                disabled={!enabledButtonInit}
                onClick={() => {
                  step_0();
                }}
              >
                Generar y descargar clave
              </button>
            )}
            {actualPhase === 2 && actualStep !== 4 && (
              <div className="d-flex flex-column flex-sm-row justify-content-center">
                <button
                  className="button mx-sm-2 mt-2"
                  disabled={!enabledButtonInit}
                  onClick={() => {
                    init_process();
                  }}
                >
                  {textButtonInit}
                </button>
              </div>
            )}
            {actualStep === 4 && (
              <button id="button-init" className="button is-link mt-0">
                <Link
                  id="go-home-trustee"
                  style={{ textDecoration: "None", color: "white" }}
                  to={
                    "/psifos/" + shortName + "/trustee/" + uuidTrustee + "/home"
                  }
                >
                  Ir al Home
                </Link>
              </button>
            )}
          </div>
          <div className="d-flex justify-content-center flex-sm-row flex-column-reverse">
            {secretKey && actualPhase === 1 && (
              <div>
                <p className="has-text-white is-size-5 mb-1 mt-4">
                  Si no encuentra el archivo, puede descargarlo nuevamente.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center mt-1">
                  <button
                    className="button is-primary mt-0"
                    onClick={() => {
                      downloadKey();
                    }}
                  >
                    Descargar clave
                  </button>
                </div>
              </div>
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

export default Keygenerator;
