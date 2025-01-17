import { useState } from "react";
import { backendOpIP, frontIP } from "../../../../server";

function ModalOpeningReady(props) {
  const [feedback, setFeedback] = useState("");
  const [generationReady, setGenerationReady] = useState(false);

  async function deleteElection() {
    const url = backendOpIP + "/" + props.shortName + "/ready-opening";
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      setFeedback("La votación esta lista para la generación de claves");
      setGenerationReady(true);
      props.openingChange()
    } else {
      setFeedback("Ha ocurrido un error");
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
          <h1 className="title">Preparar para la apertura de la elección</h1>
          <div className="field">
            <label className="">
              {!generationReady
                ? "Estas seguro que quieres pasar a la etapa de preparación de la elección?."
                : feedback}
            </label>
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
            {!generationReady && (
              <button
                className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
                onClick={deleteElection}
              >
                <span>PREPARAR</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ModalOpeningReady;
