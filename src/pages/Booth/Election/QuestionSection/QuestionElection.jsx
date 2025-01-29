import { useState, useEffect, useCallback, useRef } from "react";
import QuestionHeader from "./QuestionElection/QuestionHeader.jsx";
import ModalPercentage from "../../components/ModalPercentage";
import AlertQuestions from "./Questions/AlertQuestions";
import { answersRestrictionText } from "./utils.js";
import {
  permanentOptionsList,
  preferentialRankingTallyNames,
} from "../../../../constants";
import { isSTVQuestion } from "../../../../utils";
import { getFormalOptions } from "../../../Elections/utils.js";
import { useDispatch, useSelector } from "react-redux";
import { setAnswers } from "../../../../store/slices/boothSlice.js";
import QuestionButtons from "./QuestionElection/QuestionButtons.jsx";
import QuestionOptionsDetail from "./QuestionElection/QuestionOptionsDetail.jsx";
import QuestionInput from "./QuestionElection/QuestionInput.jsx";

const getDefaultAnswer = (currentQuestion) => {
  const getEmptyArray = (_) => [];
  const defaultAnswer = {
    STVNC: (actualQuestion) => {
      return actualQuestion.closed_options.reduce((accumulator, _, index) => {
        return [...accumulator, index];
      }, []);
    },
    MIXNET: getEmptyArray,
    CLOSED: getEmptyArray,
  };
  return defaultAnswer[currentQuestion.q_type](currentQuestion);
};


function QuestionSelectionBox({
  question,
  index,
  showAlert,
  messageAlert,
  totalQuestions,
  addAnswer,
  election,
}) {
  const selectionProps = {
    index: index,
    addAnswer: addAnswer,
    question: question,
    election: election,
  };
  const {
    formal_options: closedOptions,
    include_informal_options: includeInformalAns,
    options_specifications: formalOptionsImages,
    type: questionType,
  } = question

  return (
    <div key={index} style={{ display: "block" }}>
      {showAlert && <AlertQuestions
        message={messageAlert}
      />}

      <QuestionHeader
        actualQuestion={index}
        totalQuestions={totalQuestions}
        questions={question}
      />

      {isSTVQuestion(questionType) && <QuestionOptionsDetail
        options={
          getFormalOptions(closedOptions, includeInformalAns)
        }
        optionsImages={formalOptionsImages}
      />}

      <QuestionInput
        questionType={questionType}
        selectionProps={selectionProps}
        index={index}
      />
    </div>
  );
}

export default function QuestionElection({
  election,
  actualQuestion, nextQuestion, questions,
  encryptQuestions, isPreview, booth,
  afterEncrypt,
}) {
  const nQuestions = questions.length
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.booth.answers);

  /** @state {boolean} percentage modal state */
  const [showModal, setShowModal] = useState(false);

  /** @state {boolean} encryption status */
  const [finished, setFinished] = useState(false);

  /** @state {boolean} alert status */
  const [showAlert, setShowAlert] = useState(false);

  /** @state {string} feedback message of alert */
  const [messageAlert, setMessageAlert] = useState("");

  const defaultAnswers = useCallback(() => {
    /**
     * Default arrays are included in each response
     */
    if (answers.length !== 0) return;
    let answersAux = questions.reduce(
      (accumulator, currentValue, index) => {
        accumulator[index] = getDefaultAnswer(currentValue);
        return accumulator;
      },
      []
    );
    dispatch(setAnswers(answersAux));
  }, [answers, dispatch, questions]);

  const defaultAnswersRef = useRef(defaultAnswers);

  useEffect(() => {
    defaultAnswersRef.current();
  }, []);

  useEffect(() => {
    // Verificar si answers ha cambiado desde la última renderización
    if (defaultAnswersRef.current !== defaultAnswers) {
      defaultAnswersRef.current = defaultAnswers; // Actualizar el estado anterior
    }
  }, [defaultAnswers]);

  const checkAnswers = (index) => {
    /**
     * @param {number} index - question index
     * Check if the number of answers is correct
     * If not, show the alert
     */
    const currentQuestion = questions[index];
    const checkedIndex = answers[index];
    const numCheckedIndex = checkedIndex.length;
    const options = currentQuestion.formal_options;
    return !preferentialRankingTallyNames.includes(currentQuestion.tally_type)
      ? checkNumAnswers(numCheckedIndex, options, checkedIndex, currentQuestion)
      : true;
  };

  const checkNumAnswers = (
    numCheckedIndex,
    options,
    checkedIndex,
    currentQuestion
  ) => {
    if (
      !Boolean(
        numCheckedIndex === 1 &&
          permanentOptionsList.includes(options[checkedIndex[0]])
      )
    ) {
      const { min_answers, max_answers } = currentQuestion;
      if (numCheckedIndex < min_answers || numCheckedIndex > max_answers) {
        setShowAlert(true);
        setMessageAlert(
          "Debe " + answersRestrictionText(min_answers, max_answers)
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }
    setShowAlert(false);
    return true;
  };

  return (
    <div>
      {questions[actualQuestion] && (
        <QuestionSelectionBox
          question={questions[actualQuestion]}
          index={actualQuestion}
          showAlert={showAlert}
          messageAlert={messageAlert}
          totalQuestions={nQuestions}
          addAnswer={(answer, index) => {
            let answersAux = [...answers];
            answersAux[index] = answer;
            dispatch(setAnswers(answersAux));
          }}
          election={election}
        />
      )}

      <QuestionButtons
        actualQuestion={actualQuestion}
        nextQuestion={nextQuestion}
        answers={answers}
        numQuestions={nQuestions}
        isPreview={isPreview}
        handleAlert={setShowAlert}
        showNextButton={actualQuestion < nQuestions - 1 && !finished}
        nextButtonHandler={() => {
          if (checkAnswers(actualQuestion)) {
            nextQuestion(actualQuestion + 1);
          }
        }}
        finishButtonHandler={() => {
          if (checkAnswers(actualQuestion)) {
            encryptQuestions(answers);
            setShowModal(true);
            setFinished(true);
          }
        }}
      />

      <ModalPercentage
        booth={booth}
        show={showModal}
        onHide={() => setShowModal(false)}
        afterEncrypt={() => {
          afterEncrypt(booth.ballot.answers);
          setShowModal(false);
        }}
      />
    </div>
  );
}
