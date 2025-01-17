import { useState } from "react";
import { backendOpIP, frontIP } from "../../../../server";

function ModalGenerationKey(props) {
  const [feedback, setFeedback] = useState("");
  const [generationReady, setGenerationReady] = useState(false);

  async function changeToGenerationReady() {
    const url = backendOpIP + "/" + props.shortName + "/ready-key-generation";
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
      props.generationChange();
    } else {
      setFeedback("Ha ocurrido un error");
    }
  }

  const onHide = () => {
    setGenerationReady(false);
    props.onHide();
  }

  return (
    <div
      className={"modal " + (props.show ? "is-active" : "")}
      id="extend-modal"
    >
      <div className="modal-background" onClick={props.onHide}></div>

      <div className="modal-card">
        <section className="modal-card-body">
          <h1 className="title">Preparar para la generación de claves</h1>
          <div className="field">
            <label className="">
              {!generationReady
                ? "Estas seguro que quieres pasar a la etapa de generación de claves? No podras editar la votación después de este paso."
                : feedback}
            </label>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="container level">
            <button
              className="button review-buttons previous-button has-text-white has-text-weight-bold level-left"
              onClick={onHide}
            >
              <span>VOLVER ATRÁS</span>
            </button>
            {!generationReady && (
              <button
                className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
                onClick={changeToGenerationReady}
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

export default ModalGenerationKey;
