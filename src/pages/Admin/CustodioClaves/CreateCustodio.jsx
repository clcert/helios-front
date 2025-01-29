import FooterParticipa from "../../../component/Footers/FooterParticipa";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import NavbarAdmin from "../../../component/ShortNavBar/NavbarAdmin";
import SubNavbar from "../component/SubNavbar";
import { Button } from "react-bulma-components";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { backendOpIP } from "../../../server";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getStats } from "../../../services/election";

function CreateCustodio() {
  /**
   * View for create a new custodio
   */

  /** @state {string} name for the new trustee  */
  const [name, setName] = useState("");

  /** @state {string} login id for the new trustee  */
  const [login_id, setLoginId] = useState("");

  /** @state {string} email for the new trustee  */
  const [email, setEmail] = useState("");

  /** @state {string} feedback message for trustee creation  */
  const [message, setMessage] = useState("");

  /** @state {string} election name */
  const [nameElection, setNameElection] = useState("");

  const navigate = useNavigate();

  /** @urlParams shortName of election */
  const { shortName } = useParams();

  async function createCustodio() {
    /**
     * fetch POST create a new custodio
     */
    const token = localStorage.getItem("token");
    const url = backendOpIP + "/" + shortName + "/create-trustee";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        username: login_id,
        email: email,
      }),
    });
    if (resp.status === 200) {
      navigate("/psifos/admin/" + shortName + "/trustee", {
        state: {
          message: "Custodio creado con exito!",
        },
      });
    } else {
      setMessage("Ocurrio un error al crear el custodio, intente nuevamente");
    }
  }

  function verifyForm() {
    /**
     * Verify if form is valid
     */
    if (name === "" || email === "") {
      setMessage("Todos los campos son obligatorios");
    } else {
      createCustodio();
    }
  }

  const onKeyDownHandler = (e) => {
    if (e.keyCode === 13) {
      verifyForm();
    }
  };

  useEffect(() => {
    getStats(shortName).then((data) => {
      const { jsonResponse } = data;
      setNameElection(jsonResponse.name);
    });
  }, [shortName]);

  return (
    <div id="content-trustees">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <NavbarAdmin />
          <TitlePsifos
            namePage="Custodio de Claves"
            nameElection={nameElection}
          />
        </div>
      </section>

      <SubNavbar active={4} />

      <section
        className="section columns is-flex is-vcentered is-centered mb-0 mt-3"
        id="not-allowed-section"
      >
        <div onKeyDown={onKeyDownHandler} className="form-election">
          {message && (
            <div className="notification is-danger is-light">{message}</div>
          )}
          <div className="field">
            <label className="label label-form-election">Nombre</label>
            <div className="control">
              <input
                id="trustee-name"
                className="input"
                type="text"
                placeholder="Nombre"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="field">
            <label className="label label-form-election">Login ID</label>
            <div className="control">
              <input
                id="trustee-id"
                className="input"
                type="text"
                placeholder="Login ID"
                onChange={(e) => {
                  setLoginId(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="field">
            <label className="label label-form-election">Correo</label>
            <div className="control">
              <input
                id="trustee-email"
                className="input"
                type="text"
                placeholder="Correo"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="level">
            <Button className="button-custom mr-2 ml-2 level-left">
              <Link
                className="link-button"
                to={"/psifos/admin/" + shortName + "/trustee"}
              >
                Atras
              </Link>
            </Button>

            <Button
              id="send-trustee"
              onClick={verifyForm}
              className="button-custom mr-2 ml-2 level-right"
            >
              Crear custodio
            </Button>
          </div>
        </div>
      </section>

      <div>
        <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
      </div>
    </div>
  );
}

export default CreateCustodio;
