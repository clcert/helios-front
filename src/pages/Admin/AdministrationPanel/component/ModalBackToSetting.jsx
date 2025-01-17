import { useState } from "react";
import { backendOpIP, frontIP } from "../../../../server";

function ModalBackToSetting(props) {
  const [feedback, setFeedback] = useState("");
  const [backReady, setBackReady] = useState(false);

  async function backState() {
    const url = backendOpIP + "/" + props.shortName + "/back-to-setting-up";
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      setFeedback("La votación esta lista para la etapa de configuración");
      setBackReady(true);
      props.backChange();
    } else {
      setFeedback("Ha ocurrido un error");
    }
  }

  const onHide = () => {
    setBackReady(false);
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
          <h1 className="title">Volver a la etapa de configuración</h1>
          <div className="field">
            <label className="">
              {!backReady
                ? "Estas seguro que quieres volver a la etapa de configuración?. Podras editar la votación al volver."
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
              <span>ATRÁS</span>
            </button>
            {!backReady && (
              <button
                className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
                onClick={backState}
              >
                <span>VOLVER A PREPARACIÓN</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ModalBackToSetting;
