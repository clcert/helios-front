import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backendOpIP } from "../../../../server";

function EditVoterModal(props) {
  const initialStateVoter = {
    username: "",
    weight: "",
  };

  const [infoVoter, setInfoVoter] = useState(initialStateVoter);

  const [feecbackMessage, setFeedbackMessage] = useState("");
  const [typeAlert, setTypeAlert] = useState("is-success");

  /** @urlParam {string} shortName for election */
  const { shortName } = useParams();

  async function editVoter() {
    const token = localStorage.getItem("token");
    const resp = await fetch(
      backendOpIP + "/" + shortName + "/voters/edit",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,

          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: infoVoter.username,
          old_username: infoVoter.old_username,
          weight_init: infoVoter.weight,
        }),
      }
    );
    if (resp.status === 200) {
      const user = await resp.json();
      setTypeAlert("is-success");
      setFeedbackMessage("Votante editado con exito!");
      setInfoVoter({
        old_username: user.username,
      })
    } else {
      setTypeAlert("is-danger");
      setFeedbackMessage("Ha ocurrido un error");
    }
  }

  useEffect(() => {
    setInfoVoter({
      ...infoVoter,
      username: props.voter.username,
      old_username: props.voter.username,
      weight: props.voter.weight_init,
    });
  }, [props.voter]);

  function handleChange(e) {
    // create the new state and set it
    const { value } = e.target;
    setInfoVoter((prevState) => ({
      ...prevState,
      [e.target.name]: value,
    }));
    e.preventDefault();
  }

  return (
    <div
      className={"modal " + (props.show ? "is-active" : "")}
      id="extend-modal"
    >
      <div className="modal-background" onClick={props.onHide}></div>

      <div className="modal-card">
        <section className="modal-card-body">
          <h1 className="title">Editar al votante {props.voterName}</h1>
          <div className="">
            {feecbackMessage && (
              <div className={"notification " + typeAlert + " is-light"}>
                {feecbackMessage}
              </div>
            )}
            <div className="field mb-1">
              <label className="label">Nombre de dusuario del votante</label>
              <div className="control">
                <input
                  className="input mr-2"
                  name="username"
                  type="text"
                  value={infoVoter.username}
                  onChange={handleChange}
                ></input>
              </div>
            </div>
          </div>
          <div className="">
            <div className="field">
              <label className="label">Peso del votante</label>
              <div className="control">
                <input
                  className="input mr-2"
                  name="weight"
                  type="number"
                  value={infoVoter.weight}
                  onChange={handleChange}
                ></input>
              </div>
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="container level">
            <button
              className="button review-buttons previous-button has-text-white has-text-weight-bold level-left"
              onClick={() => {
                setFeedbackMessage("");
                props.setVoterSelect((prevState) => ({
                  ...prevState,
                  name: "",
                }));
                props.onHide();
              }}
            >
              <span>VOLVER ATRÁS</span>
            </button>

            <button
              onClick={() => editVoter()}
              className="button review-buttons previous-button has-text-white has-text-weight-bold level-right"
            >
              <span>EDITAR</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default EditVoterModal;
