import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backendOpIP } from "../../../server";
import { getEgParams } from "../../../services/crypto";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import ImageFooter from "../../../component/Footers/ImageFooter";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import imageTrustees from "../../../static/svg/trustees2.svg";
import DropFile from "./components/DropFile";
import ModalDecrypt from "./components/ModalDecrypt";
import DecryptAndProve from "../../../crypto/DecryptAndProve";

function DecryptProve() {
  const [actualStep, setActualStep] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(
    "Esperando clave para generar desencriptación parcial"
  );

  const { shortName, uuidTrustee } = useParams();

  const key = useRef(
    new DecryptAndProve(shortName, uuidTrustee, {
        setActualStep: setActualStep,
        setFeedbackMessage: setFeedbackMessage,
      },
    )
  );
  const decrypt = async (sk) => {
    try {
      setFeedbackMessage("Generando desencriptado parcial...");
      setActualStep(1);
      setTimeout(() => {
        key.current.handlerDecrypt(sk);
      }, 500);
    } catch(err) {
      setFeedbackMessage("Clave incorrecta");
      setActualStep(0);
      return;
    }

    setFeedbackMessage("Generando desencriptado parcial...");
    setActualStep(1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await key.current.handlerDecrypt(sk);
    } catch (error) {
      console.error(error);
      setFeedbackMessage("Error al generar desencriptado parcial");
      setActualStep(0);
    }
  };

  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <MyNavbar
            linkExit={`${backendOpIP}/${shortName}/trustee/logout`}
            linkInit={`/${shortName}/trustee/${uuidTrustee}/home`}
          />
          <TitlePsifos
            namePage="Custodio de Claves"
            nameElection={"Etapa 3: Verificación clave privada"}
          />
        </div>
      </section>

      <section className="section" id="medium-section">
        <div className="container has-text-centered has-text-white is-max-desktop">
          <div id="sk_section">
            <h3>Inserte su archivo con Clave Privada aquí</h3>
            <DropFile setText={decrypt} />
            <p
              id={`feedback-message-${actualStep}`}
              className="has-text-white pt-4 is-size-4"
            >
              {feedbackMessage}
              <i
                className={
                  "ml-2 " + (actualStep === 1 ? "fa-solid fa-spinner fa-spin" : "")
                }
              ></i>
            </p>
              <div className="d-flex justify-content-center flex-sm-row flex-column-reverse mt-4">
                <button className="button is-link mx-sm-2 mt-2">
                  <Link
                    id="go-home-trustee"
                    style={{ textDecoration: "None", color: "white" }}
                  to={
                    actualStep < 2
                      ? `/psifos/${shortName}/trustee/${uuidTrustee}/home`
                      : `/psifos/booth/${shortName}/public-info`
                  }
                  >
                  {actualStep < 2 ? "Volver atrás" : "Ir al Portal de Información"}
                  </Link>
                </button>
              </div>
            <div className="mt-4"></div>
          </div>
        </div>
        <ModalDecrypt show={actualStep === 1} />
      </section>
      <div>
        <ImageFooter imagePath={imageTrustees} />
        <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
      </div>
    </div>
  );
}

export default DecryptProve;
