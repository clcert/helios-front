import { useCallback, useEffect, useState } from "react";
import { DescriptionInput } from "../component/OptionQuestions";
import AnswersSetup from "./AnswersSetup/AnswersSetup";
import NumberOfAnswersSetup from "../component/OptionQuestions";
import DeleteQuestionButton from "../component/DeleteQuestionButton";
import QuestionStatementInput from "../component/QuestionStatementInput";
import QuestionTypeSelector from "../component/QuestionTypeSelector";
import IncludeBlankNullCheckbox from "../component/IncludeBlankNullCheckbox";
import GroupApplicationsCheckbox from "../component/GroupApplicationsCheckbox";
import NumberOfWinnersInput from "../component/NumberOfWinnersInput";
import ExcludingGroups from "../component/ExcludingGroups";
import { isSTVQuestion } from "../../../../utils";
import { applyAccent } from "../../utils";
import { generateClosedOptions, getListFromObjects } from "../utils";

const editAnswer = (
  key, newValue, answerObjects, question, updateThisQuestion,
)  => {
  const updatedAnswers = answerObjects.map((answer) => 
    answer.key === key ? {
      ...answer, value: applyAccent(newValue)
    } : answer
  );
  const ansList = getListFromObjects(updatedAnswers)
  const updatedQuestion = {
    ...question,
    formal_options: ansList
  };
  updateThisQuestion(updatedQuestion);
}

const editAnswerImg = (
  key, newValue, imageObjects, question, updateThisQuestion
) => {
  const updatedImgList = imageObjects.map((img) =>
    img.key === key ? {
      ...img, value: applyAccent(newValue)
    } : img
  );

  const updatedQuestion = {
    ...question,
    options_specifications: getListFromObjects(updatedImgList)
  };

  updateThisQuestion(updatedQuestion);
}

function Title({ title }) {
  return (
    <div className="create-title mb-1">
      {title}
    </div>
  );
}

export default function QuestionCard({
  updateQuestion, question, questionId,
  disabledEdit, remove, checkOptions,
}) {

  const {
    include_informal_options, num_of_winners,
    type, title, description,
    formal_options, options_specifications,
    excluded_options, grouped_options,
    min_answers, max_answers,
  } = question

  /** Attributes of the question that can be changed */
  const [answerObjects, setAnswerObjects] = useState([]);
  const [imageObjects, setImageObjects] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionType, setQuestionType] = useState("CLOSED");
  const [includesInformalAns, setIncludesInformalAns] = useState(include_informal_options);
  const [numberOfWinners, setNumberOfWinners] = useState(true);

  /** Checks if the question characteristics are allowed */
  const [descriptionChecked, setDescriptionChecked] = useState(true);
  const [numberOfAnsChecked, setNumberOfAnsChecked] = useState(true);

  const numOfClosedOptions = formal_options.length;
  const initComponent = useCallback(() => {
    if (question !== undefined) {
      let answersAux = [];
      let imgAux = [];

      for (let i = 0; i < numOfClosedOptions; i++) {
        answersAux.push({
          key: i,
          value: formal_options[i],
        });
        imgAux.push({
          key: i,
          value: options_specifications[i],
        });
      }
      setAnswerObjects(answersAux);
      setImageObjects(imgAux);
      setQuestionNumber(numOfClosedOptions);
      setQuestionType(type);
    }
  }, [numOfClosedOptions, question]);

  useEffect(() => {
    initComponent();
  }, [initComponent]);

  useEffect(() => {
    checkOptions(
      descriptionChecked && numberOfAnsChecked && numberOfWinners
    );
  }, [descriptionChecked, numberOfAnsChecked, numberOfWinners]);

  function addAnswer() {
    let newAnsWithKeyList = answerObjects.concat({
      key: questionNumber,
      value: "",
    });
    let newImgWithKeyList = imageObjects.concat({
      key: questionNumber,
      value: "",
    });
    let auxQuestion = question;
    
    const ansList = getListFromObjects(newAnsWithKeyList)
    auxQuestion.formal_options = ansList
    auxQuestion.options_specifications = getListFromObjects(newImgWithKeyList);
    updateQuestion(questionId, auxQuestion);
    setAnswerObjects(newAnsWithKeyList);
    setImageObjects(newImgWithKeyList)
    setQuestionNumber(questionNumber + 1);
  }

  function handleRemoveOption(key) {
    /**
     * remove item from array
     * @param {number} key
     */

    let newAnsWithKeyList = [];
    let newImgWithKeyList = [];
    for (let i = 0; i < answerObjects.length; i++) {
      if (answerObjects[i].key < key) {
        newAnsWithKeyList.push(answerObjects[i]);
        newImgWithKeyList.push(imageObjects[i]);
      } else if (answerObjects[i].key > key) {
        newAnsWithKeyList.push({
          key: answerObjects[i].key - 1,
          value: answerObjects[i].value,
        });
        newImgWithKeyList.push({
          key: imageObjects[i].key - 1,
          value: imageObjects[i].value,
        });
      }
    }
    let auxQuestion = question;
    auxQuestion.formal_options = newAnsWithKeyList
    auxQuestion.options_specifications = getListFromObjects(newImgWithKeyList);
    updateQuestion(questionId, auxQuestion);
    setAnswerObjects(newAnsWithKeyList);
    setImageObjects(newImgWithKeyList);
    setQuestionNumber(questionNumber - 1);
  }

  function changeQuestionType(e) {
    /**
     * change question type
     * @param {event} e
     */
    setQuestionType(e.target.value);
    let auxQuestion = question;
    auxQuestion.type = e.target.value;
    auxQuestion.formal_options= []
    auxQuestion.options_specifications = [];
    setAnswerObjects([]);
    setImageObjects([]);
    updateQuestion(questionId, auxQuestion);
  }

  return (
    <div className="form-question mt-5">
      <DeleteQuestionButton
        enable={!disabledEdit}
        handleDelete={remove}
      />

      <Title title="Pregunta" />

      <QuestionStatementInput
        questionId={questionId}
        disabledEdit={disabledEdit}
        statement={title}
        handleChange={(e) => {
          let auxQuestion = question;
          auxQuestion.title = e.target.value;
          updateQuestion(questionId, auxQuestion);
        }}
      />

      <QuestionTypeSelector
        disabledEdit={disabledEdit}
        handleChange={changeQuestionType}
        questionType={questionType}
      />

      <IncludeBlankNullCheckbox
        handleChange={(e) => {
          const includes = e.target.checked
          let auxQuestion = question;
          auxQuestion.include_informal_options = e.target.checked;
          auxQuestion.formal_options = getListFromObjects(answerObjects)
          updateQuestion(questionId, auxQuestion);
          setIncludesInformalAns(!includesInformalAns);
        }}
        disabledEdit={disabledEdit}
        checkedOption={include_informal_options}
      />

      <ExcludingGroups
        handleChange={(e) => {
          let auxQuestion = question;
          auxQuestion.excluded_options = e.target.checked;
          updateQuestion(questionId, auxQuestion);
        }}
        disabledEdit={disabledEdit}
        checkedOption={excluded_options}
      />

      <GroupApplicationsCheckbox
        questionType={type}
        disabledEdit={disabledEdit}
        handleChange={(e) => {
          let auxQuestion = question;
          auxQuestion.grouped_options = e.target.checked;
          updateQuestion(questionId, auxQuestion);
        }}
        checkedOption={grouped_options}
      />

      <DescriptionInput
        disabledEdit={disabledEdit}
        description={description}
        handleChange={(newDesc) => {
          let auxQuestion = question;
          auxQuestion.description = newDesc;
          updateQuestion(questionId, auxQuestion);
        }}
        checkOptions={setDescriptionChecked}
      />

      <NumberOfWinnersInput
        questionId={questionId}
        questionType={type}
        checkOptions={setNumberOfWinners}
        value={num_of_winners}
        handleNumOfWinners={(e) => {
          let auxQuestion = question;
          auxQuestion.num_of_winners = e;
          updateQuestion(questionId, auxQuestion);
        }}
        minCoteCondition={
          String(num_of_winners) === "NaN" ||
          num_of_winners === 0
        }
        maxCoteCondition={
          parseInt(num_of_winners) > formal_options.length
        }
        numberOfAns={formal_options.length}
      />

      <NumberOfAnswersSetup
        disabledMinAns={
          isSTVQuestion(type) || includesInformalAns
        }
        numOfOptions={formal_options.length}
        minAnswers={min_answers}
        handleMinAns={(e) => {
          let auxQuestion = question;
          auxQuestion.min_answers = e;
          updateQuestion(questionId, auxQuestion);
        }}
        maxAnswers={max_answers}
        handleMaxAns={(e) => {
          let auxQuestion = question;
          auxQuestion.max_answers = e;
          updateQuestion(questionId, auxQuestion);
        }}
        checkOptions={setNumberOfAnsChecked}
        disabledEdit={disabledEdit}
        questionId={questionId}
      />

      <AnswersSetup
        editAnswer={(key, newValue) => {
          editAnswer(
            key, newValue, answerObjects, question,
            (newQuestion) => updateQuestion(questionId, newQuestion)
          )
        }}
        editAnswerImg={
          (key, newValue) => editAnswerImg(
            key, newValue, imageObjects, question,
            (newQuestion) => updateQuestion(questionId, newQuestion)
        )
        }
        addAnswer={addAnswer}
        answersWithKey={answerObjects}
        handleRemoveItem={handleRemoveOption}
        question={question}
        questionId={questionId}
        updateQuestion={updateQuestion}
        disabledEdit={disabledEdit}
      />
    </div>
  );
}
