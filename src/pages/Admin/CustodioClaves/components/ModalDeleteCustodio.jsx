import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendOpIP } from "../../../../server";

function ModalDeleteCustodio(props) {
  /**
   * Modal for show info before delete a custodio
   */

  /** @state {string} message for feedback */
  const [messageFinished, setMessageFinished] = useState("");

  /** @state {boolean} state for know when fetch finish */
  const [finishDelete, setFinishDelete] = useState(false);

  const navigate = useNavigate();

  async function deleteCustodio() {
    /**
     * async function for delete a custodio from backend
     */

    try {
      const url =
        backendOpIP +
        "/" +
        props.shortName +
        "/delete-trustee/" +
        props.uuidTrustee;
      const token = localStorage.getItem("token");
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (resp.status === 200) {
        setFinishDelete(true);
        setMessageFinished("El custodio ha sido eliminado con exito!");
      }
    } catch {
      setFinishDelete(true);
      setMessageFinished("Ha ocurrido un error, vuelva a intentar nuevamente");
    }
  }

  return (
    <div
      className={"modal " + (props.show ? "is-active" : "")}
      id="extend-modal"
    >
      <div className="modal-background" onClick={props.onHide}></div>

      <div className="modal-card">
        <section className="modal-card-body">
          <h1 className="title">Eliminar Custodio de clave</h1>
          <div className="field">
            <label className="">
              {finishDelete
                ? messageFinished
                : "¿Estas seguro que quieres eliminar a este custodio?"}
            </label>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="container level">
            {finishDelete ? (
              <>
                {" "}
                <button
                  className="button review-buttons previous-button has-text-white has-text-weight-bold"
                  onClick={() => {
                    setFinishDelete(false);
                    props.onHide();
                    navigate("/psifos/admin/" + props.shortName + "/trustee");
                  }}
                >
                  <span>CERRAR</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className="button review-buttons previous-button has-text-white has-text-weight-bold level-left"
                  onClick={props.onHide}
                >
                  <span>VOLVER ATRÁS</span>
                </button>

                <button
                  className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
                  onClick={deleteCustodio}
                >
                  <span>ELIMINAR</span>
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ModalDeleteCustodio;
