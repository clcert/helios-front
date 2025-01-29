import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { backendOpIP } from "../../server";
import CabinaElection from "./Election/CabinaElection";
import Consult from "./Consult/Consult";
import NoAuth from "./NoAuth";
import LoadPage from "../../component/Loading/LoadPage";
import { getElection, getQuestions } from "../../services/election";

function Booth(props) {
  /** View for booth */

  /** @state {string} type of election */
  const [type, setType] = useState("");

  /** @state {bool} state of load election */
  const [load, setLoad] = useState(false);

  /** @state {bool} state auth to vote in election */
  const [auth, setAuth] = useState(false);

  /** @state {array} info election (questions) */
  const [electionData, setElectionData] = useState([]);

  /** @state {string} message user feedback */
  const [noAuthMessage, setNoAuthMessage] = useState("");

  /** @state {bool}  */
  const [searchParams] = useSearchParams();

  /** @state {string} shortName of election */
  const { shortName } = useParams();

  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      window.location.href = backendOpIP + "/vote/" + shortName;
    } else if (props.preview) {
      getElectionQuestionsPreview();
    } else {
      getElectionQuestions();
    }

    async function getElectionQuestionsPreview() {
      /**
       * async function to get the election data
       * check if voter can vote in election
       */

      const questions = await getQuestions(shortName);
      const election = await getElection(shortName);

      let jsonResponse = {
        election: election.jsonResponse,
        questions: questions.jsonResponse.questions,
      };

      setLoad(true);
      setElectionData(jsonResponse);
      setType(jsonResponse.election.election_type);
      setAuth(true);

    }

    async function getElectionQuestions() {
      /**
       * async function to get the election data
       * check if voter can vote in election
       */

      const url = backendOpIP + "/" + shortName + "/questions";
      const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      try {
        const jsonResponse = await resp.json();
        setLoad(true);
        const typeErrors = {
          "Election status check failed": "La elección se encuentra cerrada",
          "Election not found": "La elección no existe",
          "voter not found": "No estas habilitado para votar en esta elección",
        };

        if (resp.status === 200) {
          setElectionData(jsonResponse);
          setType(jsonResponse.election.election_type);
          setAuth(true);
        } else {
          const message =
            jsonResponse.detail in typeErrors
              ? typeErrors[jsonResponse.detail]
              : "No tienes permisos para ver ese contenido";

          setNoAuthMessage(message);
        }
      } catch (err) {
        setLoad(true);
        setNoAuthMessage("No estas habilitado para votar en esta elección");
      }
    }
  }, [props.preview, searchParams, shortName]);

  if (!load) {
    return <LoadPage />;
  } else if (!auth) {
    return (
      <NoAuth
        title={"Cabina de votación"}
        message={noAuthMessage}
        addressLogout={"/"}
      />
    );
  } else if (load) {
    return type === "Query" ? (
      <Consult consultData={electionData} />
    ) : (
      <CabinaElection preview={props.preview} electionData={electionData} />
    );
  }
}

export default Booth;
