import InputRanking from "./Questions/InputRanking";
import { OptionInputRadio } from "./Questions/InputRadio";
import { useState } from "react";
import {
  getBlankAnswerId, getNullAnswerId,
} from "../../../../utils";
import { getFormalOptions } from "../../../Elections/utils";

function InformalInput({
  questionId, selectedAnswer, selectingHandler,
  optionIds, optionLabels,
}) {
  return (
    <div>
      {optionIds.map((key, index) => {
        return (
          <OptionInputRadio
            key={`option-${key}`}
            optionId={key}
            questionId={questionId}
            optionLabel={optionLabels[index]}
            isSelected={selectedAnswer === key}
            isBordered={true}
            inputHandler={(e) => selectingHandler(
              parseInt(e.target.value)
            )}
          />
        )
      })}
    </div>
  )
}

const RankingSelection = ({
  question, addAnswer, index: questionId
}) => {
  const {
    formal_options,
    options_specifications: formalOptionsImages,
    include_informal_options,
    max_answers,
  } = question
  const includeInformalOptions = include_informal_options;
  const maxAnswers = parseInt(max_answers, 10)

  const optionIds = Array.from(formal_options.keys());
  const formalOptionIds = getFormalOptions(optionIds, includeInformalOptions)
  const formalOptionLabels = getFormalOptions(formal_options, includeInformalOptions)
  
  const [rankedAnswers, setRankedAnswers] = useState([]);
  const [selectedInformalAnswer, setSelectedInformalAnswer] = useState(undefined);

  const blankId = getBlankAnswerId(formal_options)
  const nullId = getNullAnswerId(formal_options)

  const padAnswers = (answers) => {
    const desiredLength = maxAnswers; // max_ans >= ans.length
    const currentLength = answers.length;
    if (
      currentLength === 1 && answers[0] === nullId
    ) {
      return Array(desiredLength).fill(nullId)
    }
    else {
      const padSize = desiredLength - currentLength
      return answers.concat(Array(padSize).fill(blankId))
    }
  }

  const setFinalAnswer = (ans) => {
    addAnswer(padAnswers(ans), questionId)
  }

  return (
    <div>
      <div>
        <InputRanking
          optionIds={formalOptionIds}
          optionLabels={formalOptionLabels}
          optionImages={formalOptionsImages}
          rankedAnswers={rankedAnswers}
          rankingHandler={(ans) => {
            const newAns = ans.map((item) => item-1)
            if (newAns.length > 0) {
              setRankedAnswers(newAns)
              selectedInformalAnswer && setSelectedInformalAnswer(undefined)
              setFinalAnswer(newAns)
            }
          }}
          maxAnswers={maxAnswers}
        />
        {includeInformalOptions &&
          <InformalInput
            questionId={questionId}
            selectedAnswer={selectedInformalAnswer}
            selectingHandler={
              (e) => {
                if (selectedInformalAnswer === e) {
                  setSelectedInformalAnswer(undefined)
                  setFinalAnswer([])
                }
                else {
                  setSelectedInformalAnswer(e)
                  rankedAnswers.length > 0 && setRankedAnswers([])
                  setFinalAnswer([e])
                }
              }
            }
            optionIds={[blankId, nullId]}
            optionLabels={formal_options.slice(-2)}
          />
        }
      </div>
    </div>
  );
};

export default RankingSelection;
