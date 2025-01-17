import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { backendOpIP } from "../../../../server";
import { bundleDownload } from "../../../../services/bundle";
import { electionStatus } from "../../../../constants";

function CardSettings(props) {
  /** @state {bool} state for show infor message about copy */
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  /** @urlParam {string} shortName of election  */
  const { shortName } = useParams();

  const bundleButton = async () => {
    /**
     * Get bundle file a generate download file
     */
    bundleDownload(shortName);
  };

  return (
    <div className="box ">
      <div className="is-size-4">Opciones de la elección</div>

      <hr />

      <div className="is-size-6">
        <div className="content-card-admin">
          <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
          <Link
            className="link-without-line"
            to={"/psifos/admin/" + shortName + "/edit-election/"}
          >
            Editar elección
          </Link>
        </div>
        <div className="content-card-admin">
          <div className="icon-card-admin d-inline-flex mr-2">
            <i className="fa-solid fa-circle-question"></i>
          </div>
          <Link
            className="link-without-line"
            to={"/psifos/admin/" + shortName + "/create-question/"}
          >
            Ver preguntas
          </Link>
        </div>

        {props.election.questions !== null && (
          <div className="content-card-admin">
            <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
              <i className="fa-solid fa-person-booth"></i>
            </div>
            <Link
              className="link-without-line"
              to={"/psifos/admin/" + shortName + "/booth"}
            >
              Ver previsualización
            </Link>
          </div>
        )}

        <div className="content-card-admin">
          <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
            <i className="fa-solid fa-square-poll-horizontal"></i>{" "}
          </div>
          <Link
            target="_blank"
            className="link-without-line"
            to={"/psifos/booth/" + shortName + "/public-info"}
          >
            Ver portal de información
          </Link>
        </div>

        <div className="content-card-admin">
          <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
            <i className="fa-solid fa-copy"></i>{" "}
          </div>
          <CopyToClipboard
            text={backendOpIP + "/" + shortName + "/vote"}
            onCopy={() => setShowCopyMessage(true)}
          >
            <span>
              <Link to="" className="link-without-line">
                Copiar link de elección
              </Link>
              {showCopyMessage && (
                <span className="alert-copy ml-2">Link copiado!</span>
              )}
            </span>
          </CopyToClipboard>
        </div>
        {(props.election.status ===
          electionStatus.decryptionsCombined ||
          props.election.status ===
            electionStatus.resultsReleased) && (
          <div onClick={bundleButton} className="content-card-admin">
            <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
              <i className="fa-solid fa-file-arrow-down"></i>{" "}
            </div>
            <Link
              id="bundle-button-download"
              className="link-without-line"
              to=""
            >
              Descargar archivo de verificación
            </Link>
          </div>
        )}
        <div className="content-card-admin">
          <div className="icon-card-admin d-inline-flex justify-content-center mr-2">
            <i className="fa-solid fa-trash "></i>
          </div>
          <Link
            className="link-without-line-red"
            to=""
            onClick={() => {
              props.setDeleteElectionModal(true);
            }}
          >
            Eliminar elección
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CardSettings;
