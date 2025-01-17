import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { backendOpIP } from "../../../server";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import ImageFooter from "../../../component/Footers/ImageFooter";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import imageTrustees from "../../../static/svg/trustees2.svg";
import DropFile from "./components/DropFile";
import { useSelector } from "react-redux";
import CheckSecretKey from "../../../crypto/CheckSecretKey";

function CheckSk() {
  const election = useSelector((state) => state.election.actualElection);

  /** @state {string} trustee shortName */
  const { shortName, uuidTrustee } = useParams();

  /** @state {string} message with check result */
  const [feedbackMessage, setFeedbackMessage] = useState("");


  const key = useRef(
    new CheckSecretKey(shortName, uuidTrustee, {
      reactFunctions: {
        setFeedbackMessage: setFeedbackMessage,
      },
    })
  );

  useEffect(() => {
    key.current.initParams();
  }, []);

  function check_sk(sk) {
    key.current.checkSk(sk);
  }

  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <MyNavbar
            linkExit={`${backendOpIP}/${shortName}/trustee/logout`}
            linkInit={"/" + shortName + "/trustee/" + uuidTrustee + "/home"}
          />
          <TitlePsifos
            namePage="Portal de Custodio de Clave: Verificación de Clave Privada"
            nameElection={election.name} // TODO: Retrieve this value
          />
        </div>
      </section>

      <section className="section" id="medium-section">
        <div className="container has-text-centered is-max-desktop">
          <h4 className="has-text-white">Inserte su archivo con Clave Privada aquí</h4>
          <DropFile setText={check_sk} />
          <p id="feedback-check" className="has-text-white is-size-4 mt-3">{feedbackMessage}</p>
          <div className="d-flex justify-content-center flex-sm-row flex-column-reverse mt-4">
            <button id="button-init" className="button is-link mx-sm-2 mt-2">
              <Link
                style={{ textDecoration: "None", color: "white" }}
                to={"/psifos/" + shortName + "/trustee/" + uuidTrustee + "/home"}
              >
                Volver atrás
              </Link>
            </button>
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

export default CheckSk;
