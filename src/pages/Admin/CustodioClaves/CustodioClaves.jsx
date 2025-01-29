import FooterParticipa from "../../../component/Footers/FooterParticipa";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import imageTrustees from "../../../static/svg/trustees-list.svg";
import ImageFooter from "../../../component/Footers/ImageFooter";
import TrusteesList from "./components/TrusteesList";
import { backendOpIP } from "../../../server";
import "../../../static/css/booth.css";
import SubNavbar from "../component/SubNavbar";
import NavbarAdmin from "../../../component/ShortNavBar/NavbarAdmin";
import ModalCreateCustodio from "./components/ModalCreateCustodio";
import ModalDeleteCustodio from "./components/ModalDeleteCustodio";

import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getElection } from "../../../services/election";
import CopyToClipboard from "react-copy-to-clipboard";
import { useDispatch, useSelector } from "react-redux";
import { setElection } from "../../../store/slices/electionSlice";

function CustodioClaves(props) {
  const dispatch = useDispatch();
  const election = useSelector((state) => state.election.actualElection);

  /** @state {boolean} state of modal with create info  */
  const [modalCustodio, setModalCustodio] = useState(false);

  /** @state {boolean} state of model with delete trustee info  */
  const [modalDelete, setModalDelete] = useState(false);

  /** @state {boolean} state of copy message  */
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  /** @state {string} shortName trustee  */
  const [uuidTrustee, setUuidTrustee] = useState("");

  const location = useLocation();

  const { shortName } = useParams();

  const initComponent = useCallback(() => {
    getElection(shortName).then((election) => {
      dispatch(setElection(election.jsonResponse));
    });
  }, [shortName, dispatch]);

  useEffect(() => {
    if (Object.keys(election).length === 0) {
      initComponent();
    }
  }, [election, initComponent]);
  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <NavbarAdmin />
          <TitlePsifos
            namePage="Custodio de Claves"
            nameElection={election.name}
          />
        </div>
      </section>

      <SubNavbar active={4} />

      <section className="section voters-section">
        <div className="container has-text-centered is-max-desktop">
          {location.state && (
            <div className="notification is-primary is-light">
              {location.state.message}
            </div>
          )}
          <div className="has-text-centered title is-size-4-mobile mt-2">
            Panel de custodios
          </div>
          <div
            className="box has-text-centered border-style-box"
            id="border-style-box"
          >
            <div className="has-text-left mb-0">
              <div>
                - Los custodios de claves son los responsables de desencriptar
                el escrutinio de la elección.
              </div>
              <div className="mt-2">
                - Cada custodio de clave generará un par de claves (pública y
                privada), donde la clave pública es subida al servidor.
              </div>
              <div className="mt-2">
                - Al momento de desencriptar el escrutinio, cada custodio de
                claves proveerá su clave privada.
              </div>
            </div>
          </div>
          {election.status === "Setting up" && (
            <>
              <div className="d-flex justify-center flex-column">
                <div>
                  <button
                    id="add-trustee"
                    className="button button-custom mb-4"
                    onClick={() => {
                      setModalCustodio(true);
                    }}
                  >
                    AGREGAR CUSTODIO DE CLAVE
                  </button>
                </div>
                {!election.has_helios_trustee && (
                  <div>
                    <button
                      id="add-trustee"
                      className="button button-custom mb-4"
                      onClick={() => {}}
                    >
                      Servidor como custodio
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <div
            className="box has-text-centered border-style-box"
            id="border-style-box"
          >
            <div>
              <span>Link de conexión custodio: </span>
              <CopyToClipboard
                text={backendOpIP + "/trustee/login/panel"}
                onCopy={() => setShowCopyMessage(true)}
              >
                <span>
                  <span className="link-without-line">
                    Copiar <i className="fa-solid fa-copy"></i>
                  </span>
                  {showCopyMessage && (
                    <span className="alert-copy ml-2">Link copiado!</span>
                  )}
                </span>
              </CopyToClipboard>
            </div>
            <div className="mt-2">
              <span
                className="link-without-line font-caption"
                onClick={() => {
                  window.open(
                    backendOpIP + "/trustee/login/panel",
                    "_blank"
                  );
                }}
              >
                Click para ir al sitio web del custodio
              </span>
            </div>
          </div>
          <TrusteesList
            deleteTrustee={(uuid) => {
              setUuidTrustee(uuid);
              setModalDelete(true);
            }}
            election={election}
          />
        </div>
      </section>
      <div>
        <ImageFooter imagePath={imageTrustees} />
        <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
      </div>
      <ModalCreateCustodio
        show={modalCustodio}
        onHide={() => setModalCustodio(false)}
        shortName={shortName}
      />
      <ModalDeleteCustodio
        show={modalDelete}
        onHide={() => setModalDelete(false)}
        shortName={shortName}
        uuidTrustee={uuidTrustee}
      />
    </div>
  );
}

export default CustodioClaves;
