import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getElectionPublic } from "../../../services/election";
import NotAvalaibleMessage from "../../../component/Messages/NotAvailableMessage";
import { electionStatus, informalOptions } from "../../../constants";
import CalculatedResults from "./CalculatedResults";
import { parseResult } from "./parseResult";

function NoCalculatedResults({ getElectionResult }) {
  return (
    <>
      <NotAvalaibleMessage message="Sin resultados calculados" />
      <span className="ml-3 is-size-6 mb-2" onClick={getElectionResult}>
        <Link className="link-without-line" to="">
          <i className="fa-solid fa-arrows-rotate"></i> Actualizar
        </Link>
      </span>
    </>
  );
}

function Results({ isAdmin = false }) {
  const [groupedResults, setGroupedResults] = useState([]);

  /** @state {array} election results (resume) */
  const [totalResults, setTotalResults] = useState([]);

  const [groupResult, setGroupResult] = useState([]);

  /** @state {array} election questions */
  const [questions, setQuestions] = useState([]);

  const [group, setGroup] = useState("Sin grupo");

  const [groups, setGroups] = useState([]);

  /** @state {bool} state of load info */
  const [load, setLoad] = useState(false);

  const [election, setElection] = useState({});

  /** @urlParam {string} shortName of election */
  const { shortName } = useParams();

  const handleResults = (questionsObject, resultObject, setResult) => {
    let result = [];
    questionsObject.forEach((element, q_num) => {
      element.formal_options = element.formal_options.includes("Voto Blanco")
        ? element.formal_options
        : element.formal_options.concat(informalOptions);
      result.push(
        parseResult(
          element,
          resultObject[q_num],
          questionsObject[q_num].include_informal_options
        )
      );
    });
    setResult(result);
    setQuestions(questionsObject);
  };

  const handleTotalResults = (questionsObject, resultObject) => {
    handleResults(questionsObject, resultObject, setTotalResults);
  };

  const handleGroupResults = (questionsObject, resultObject) => {
    handleResults(questionsObject, resultObject.result, setGroupResult);
  };

  const getElectionResult = useCallback(async () => {
    setLoad(false);
    try {
      const election = await getElectionPublic(shortName);
      const { resp, jsonResponse } = election;
      if (resp.status === 200) {
        setElection(jsonResponse);
        if (
          jsonResponse.status === electionStatus.resultsReleased ||
          jsonResponse.status === electionStatus.decryptionsCombined
        ) {
          const questionsObject = jsonResponse.questions;
          const resultObject = jsonResponse.result;
          setGroupedResults(resultObject.grouped_result);
          setTotalResults(resultObject.total_result);
          setResultGroups(resultObject.grouped_result);
          handleTotalResults(questionsObject, resultObject.total_result);
          let result = resultObject.grouped_result.find((element) => element.group === "Sin grupo");
          if (!result) {
            result = resultObject.grouped_result[0];
            setGroup(result.group);
          } 
          handleGroupResults(questionsObject, result);
        }
      }
    } catch (error) {
      console.error("Failed to fetch election results:", error);
    } finally {
      setLoad(true);
    }
  }, [shortName]);

  const setResultGroups = (groupedResults) => {
    const auxResult = groupedResults.map((result) => {
      return result.group;
    });
    setGroups(auxResult);
  };

  useEffect(() => {
    getElectionResult();
  }, [getElectionResult]);

  const initComponent = useCallback(() => {
    const result = groupedResults.find((element) => {
      return element.group === group;
    });

     if(result) handleGroupResults(questions, result);
  }, [group, groupedResults, questions]);

  useEffect(() => {
    initComponent();
  }, [initComponent]);
  return (
    <>
      {!load ? (
        <div className="spinner-animation"></div>
      ) : (
        <>
          {election.status === electionStatus.resultsReleased ||
          (election.status === electionStatus.decryptionsCombined && isAdmin) ? (
            <div className="container">
              <CalculatedResults
                election={election}
                questions={questions}
                totalResults={totalResults}
                groupResult={groupResult}
                group={group}
                groups={groups}
                setGroup={setGroup}
              />
            </div>
          ) : (
            <NoCalculatedResults getElectionResult={getElectionResult} />
          )}
        </>
      )}
    </>
  );
}

export default Results;
