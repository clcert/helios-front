
import {
  isMixNetQuestion, isSTVQuestion, isClosedQuestion,
} from "../../../../../utils";
import {
  generateClosedOptionsString,
} from "./utils";
import {
  generateClosedOptions,
} from "../../utils";
import STVAnswersSetup from "./STVAnswersSetup";
import ClosedAnswersSetup from "./ClosedAnswerSetup";
import MixnetAnswersSetup from "./MixnetAnswersSetup";

const imageToBytes = (
  questionId, optionId, editAnswerImg,
) => {
  const input = document.getElementById(
    `fileinput_question_${questionId}_option_${optionId}`
  );
  const reader = new FileReader();
  reader.onloadend = function () {
      const base64String = reader.result.split(",")[1];
      editAnswerImg(optionId, base64String);
  };
  if (input.files && input.files[0]) {
      reader.readAsDataURL(input.files[0]);
  }
}


export default function AnswersSetup({
  question, questionId, disabledEdit,
  updateQuestion, editAnswerImg, editAnswer,
  handleRemoveItem, addAnswer,
  answersWithKey,
}) {
  const {
    formal_options, type,
  } = question

  function downloadFile() {
    const textToSave = generateClosedOptionsString(formal_options);
    let hiddenElement = document.createElement("a");
    hiddenElement.download = `answers.txt`;
    const blob = new Blob([textToSave], {
      type: "text/plain",
    });
    hiddenElement.href = window.URL.createObjectURL(blob);
    hiddenElement.click();
  }

  function filesToString() {
    const input = document.getElementById("fileinput_" + questionId);
    var reader = new FileReader();
    reader.onload = function () {
      let newAns = reader.result.split("\n");
      newAns = newAns.filter((element) => {
        return element !== "";
      });
      let auxQuestion = question;
      const validAns = Array.from(new Set(newAns))
      auxQuestion.formal_options = validAns;
      auxQuestion.options_specifications = Array(validAns.length).fill("")
      updateQuestion(questionId, auxQuestion);
    };
    reader.readAsText(input.files[0]);
  }

  return (
    <>
      {isSTVQuestion(type) && (
        <STVAnswersSetup
          answersWithKey={answersWithKey}
          disabledEdit={disabledEdit}
          questionId={questionId}
          handleRemoveAns={handleRemoveItem}
          handleChangeAns={editAnswer}
          handleNewAns={addAnswer}
          imageToBytes={
            (questionId, optionId) => imageToBytes(
              questionId, optionId, editAnswerImg
            )
          }
        />
      )}
      
      {isClosedQuestion(type) && (
        <ClosedAnswersSetup
          answersWithKey={answersWithKey}
          disabledEdit={disabledEdit}
          questionId={questionId}
          handleRemoveAns={handleRemoveItem}
          handleChangeAns={editAnswer}
          handleNewAns={addAnswer}
        />
      )}

      {isMixNetQuestion(type) && (
        <MixnetAnswersSetup
          disabledEdit={disabledEdit}
          handleFileChange={filesToString}
          closedOptions={formal_options}
          handleDownloadFile={downloadFile}
          q_num={questionId}
        />
      )}
    </>
  );
}
