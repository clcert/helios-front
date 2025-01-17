import React from "react";
import { 
  isMixNetQuestion, isSTVQuestion, usesMixNetTally,
  getBlankAnswerId, getNullAnswerId,
} from "../../../../utils";

function ShowAnswer({ questionType, indexAnswer, numOptions, index, answer }) {
  return (
    Boolean(answer) && (
      !isMixNetQuestion(questionType)
      || indexAnswer < numOptions
    ) && (
      <React.Fragment key={index}>
        <span key={index}>
          {(
            isSTVQuestion(questionType)
            ? `Posición ${index+1}°: `
            : "[ ✓ ] "
          ) + (
            isMixNetQuestion(questionType) && answer.split(",").length > 1
            ? answer.split(",")[0]
            : answer
          )}
        </span>
        <br />
      </React.Fragment>
    )
  );
}

function ShowAnswersList({ currentAns, questionType, closedOptions }) {
  return (
    <p className="mb-0">
      {currentAns.map((key, index) => {
        const indexAnswer = (
          isMixNetQuestion(questionType) ? key - 1 : key
        )
        return (
          <ShowAnswer
            questionType={questionType}
            indexAnswer={indexAnswer}
            numOptions={closedOptions.length}
            index={index}
            answer={closedOptions[indexAnswer]}
            key={`${index}.-${closedOptions[indexAnswer]}`}
          />
        );
      })}
    </p>
  );
}


function TextSelected({ answer, question }) {
  const includeBlankNull = question.include_informal_options;
  const blankId = getBlankAnswerId(question.formal_options)
  const nullId = getNullAnswerId(question.formal_options)
  if (answer.length === 0) {
    return <p>[ ] Ninguna opción seleccionada</p>;
  }
  else if (
    includeBlankNull
  ) {
    if (
      answer.every((element) => element === blankId)
    ) {
      return <p>Respuesta en blanco</p>;
    }
    else if(
      answer.every((element) => element === nullId)
    ) {
      return <p>Respuesta nula</p>;
    }
  }
  return (
    <ShowAnswersList
      currentAns={answer}
      questionType={question.type}
      closedOptions={question.formal_options}
    />
  );
}

export default TextSelected;
