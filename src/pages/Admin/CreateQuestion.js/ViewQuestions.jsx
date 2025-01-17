import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getElection, getQuestions } from "../../../services/election";
import { useDispatch, useSelector } from "react-redux";
import { setElection } from "../../../store/slices/electionSlice";
import { electionStatus } from "../../../constants";
import {
  parseSavedQuestionList, getDefaultQuestion,
  postQuestionList, isNotEmpty,
} from "./utils";
import ViewQuestionsMainInterface from "./ViewQuestionsMainInterface";
import ViewQuestionsButtons from "./ViewQuestionsButtons";
import QuestionCards from "./QuestionCards/QuestionCards";
import ViewQuestionsAlert from "./ViewQuestionsAlert";

const checkQuestionList = (questionList, optionsChecked) => {
  /**
 * check if the questions are valid
 * @returns {boolean} true if the questions are valid
 */
  let isValid = true;
  questionList.forEach((q) => {
    let nSpecifications = q.options_specifications.length
    let nFormalOptions = q.formal_options.length
    
    nFormalOptions = q.include_informal_options && nFormalOptions
    if (!q.title || nFormalOptions !== nSpecifications) {
      isValid = false;
    }
  });
  if (!optionsChecked) {
    isValid = false;
  }
  return isValid;
}

export default function ViewQuestions(props) {
  /**
   * view that is responsible for creating a question
   */

  const dispatch = useDispatch();
  const election = useSelector((state) => state.election.actualElection);

  const [nQuestions, setNQuestions] = useState(1);
  const [questionList, setQuestionList] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [colorAlert, setColorAlert] = useState("");
  const [disabledEdit, setDisabledEdit] = useState("");
  const [optionsChecked, setOptionsChecked] = useState(true);

  /** @urlParam {string} shortName of election */
  const { shortName } = useParams();

  const initComponent = useCallback((election, election_questions) => {
    election_questions && setQuestionList(
      parseSavedQuestionList(
        election_questions
      )
    )
    setDisabledEdit(election.status !== electionStatus.settingUp);
  }, []);

  useEffect(() => {
    const fetchQuestionsAndElection = async () => {
      try {
        const questionsResp = await getQuestions(shortName);
        if (Object.keys(election).length === 0) {
          const electionResp = await getElection(shortName);
          dispatch(setElection(electionResp.jsonResponse));
          initComponent(electionResp.jsonResponse, electionResp.jsonResponse.questions);
        } else {
          initComponent(election, questionsResp.jsonResponse.questions);
        }
      } catch (error) {
        console.error("Error fetching questions or election:", error);
      }
    };

    fetchQuestionsAndElection();
  }, [shortName, dispatch, election, initComponent]);

  function addQuestion() {
    /**
     * add new question to array allowing rendering
     */
    let questionListAux = questionList.concat(
      getDefaultQuestion(nQuestions)
    );
    setQuestionList(questionListAux);
    setNQuestions(nQuestions + 1);
  }

  function removeQuestion(key) {
    /**
     * remove a question from array
     * @param {number} key
     */
    let newQuestionList = [];
    for (let i = 0; i < questionList.length; i++) {
      if (questionList[i].index !== key) {
        newQuestionList.push(questionList[i]);
      }
    }
    setQuestionList(newQuestionList);
  }

  function updateQuestion(key, newValue) {
    let auxQuestionList = [...questionList];
    for (let i = 0; i < auxQuestionList.length; i++) {
      if (auxQuestionList[i].index === key) {
        auxQuestionList[i] = newValue;
      }
      setQuestionList(auxQuestionList);
    }
  }

  async function sendQuestions() {
    /**
     * send the questions to the server
     */
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    
    const auxQuestions = [...questionList];

    if (checkQuestionList(questionList, optionsChecked)) {
      postQuestionList(
        shortName,
        auxQuestions,
        () => {
          setAlertMessage("Preguntas creadas con éxito!");
          setColorAlert("is-success");
        },
        (resp) => {
          const data = resp.json();
          setAlertMessage(data["message"]);
          setColorAlert("is-danger");
        }
      )
    } else {
      setAlertMessage("Hay errores en el formulario");
      setColorAlert("is-danger");
    }
  }

  return (
    <ViewQuestionsMainInterface>
      <div className="question-content">
        {isNotEmpty(alertMessage) && <ViewQuestionsAlert
          colorAlert={colorAlert}
          closeAlert={() => setAlertMessage("")}
          alertMessage={alertMessage}
        />}
        <QuestionCards
          questionList={questionList}
          election={election}
          disabledEdit={disabledEdit}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
          handleOptionsChecked={setOptionsChecked}
        />
        <ViewQuestionsButtons
          shortName={shortName}
          disabledEdit={disabledEdit}
          addQuestion={addQuestion}
          sendQuestions={sendQuestions}
        />
      </div>
    </ViewQuestionsMainInterface>
  );
}
