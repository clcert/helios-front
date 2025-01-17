import { backendOpIP } from "../../../../server";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

function DeleteVoterModal(props) {
  /**
   * Modal for delete voters from a file
   */

  /** @state {bool} modal state to delete voters */
  const [deleteState, setDeleteState] = useState(false);

  /** @state {string} status to see if it finished delete */
  const [finishedDelete, setFinishedDelete] = useState(false);

  /** @state {string} status to see if an error occurred */
  const [errorDelete, setErrorDelete] = useState(false);

  /** @urlParam {string} uuid for election */
  const { shortName } = useParams();

  async function deleteVoter() {
    /**
     * async function to delete the voters to the server
     */

    try {
      setDeleteState(true);
      const token = localStorage.getItem("token");
      const resp = await fetch(
        backendOpIP +
          "/" +
          shortName +
          "/voter/" +
          props.voter.username +
          "/delete",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setDeleteState(false);
      setFinishedDelete(true);
      if (resp.status === 200) {
      } else {
        setErrorDelete(true);
      }
    } catch (error) {
      setDeleteState(false);
      setFinishedDelete(true);
      setErrorDelete(true);
    }
  }
  useEffect(() => {
    setDeleteState(false);
    setFinishedDelete(false);
  }, []);
  if (!finishedDelete) {
    return (
      <div
        className={"modal " + (props.show ? "is-active" : "")}
        id="extend-modal"
      >
        <div className="modal-background" onClick={props.onHide}></div>
        {deleteState ? (
          <div className="modal-card">
            <section className="modal-card-body">
              <h1 className="title">
                El votante {props.voter.name} esta siendo eliminado...
              </h1>
              <div className="field">
                <label className="label label-form-election">
                  Espere un momento...
                </label>
              </div>
            </section>
          </div>
        ) : (
          <div className="modal-card">
            <section className="modal-card-body">
              <h1 className="title">
                Eliminar Votante {props.voter.name}
              </h1>
              <div className="">
                El votante {props.voter.name} sera eliminado
              </div>
            </section>
            <footer className="modal-card-foot">
              <div className="container level">
                <button
                  className="button review-buttons previous-button has-text-white has-text-weight-bold level-left"
                  onClick={props.onHide}
                >
                  <span>VOLVER ATRÁS</span>
                </button>

                <button
                  className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
                  onClick={deleteVoter}
                >
                  <span>ELIMINAR</span>
                </button>
              </div>
            </footer>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div
        className={"modal " + (props.show ? "is-active" : "")}
        id="extend-modal"
      >
        <div className="modal-background" onClick={props.onHide}></div>

        <div className="modal-card">
          {!errorDelete ? (
            <section className="modal-card-body">
              <h1 className="title">Proceso terminado con exito</h1>
              <div className="field">
                <label className="label label-form-election">
                  El votante {props.voter.name} ha sido eliminado con
                  exito!
                </label>
              </div>
            </section>
          ) : (
            <section className="modal-card-body">
              <h1 className="title">Ha ocurrido un error</h1>
              <div className="field">
                <label className="label label-form-election">
                  El votante {props.voter.name} no ha podido ser
                  eliminado, intente nuevamente...
                </label>
              </div>
            </section>
          )}

          <footer className="modal-card-foot">
            <div className="d-flex justify-content-center">
              <button
                className="button review-buttons previous-button has-text-white has-text-weight-bold"
                onClick={() => {
                  setFinishedDelete(false);
                  props.setVoterSelect((prevState) => ({
                    ...prevState,
                    name: "",
                  }));
                  props.onHide();
                }}
              >
                <span>VOLVER ATRÁS</span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}

export default DeleteVoterModal;
