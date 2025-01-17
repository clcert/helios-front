import { useSelector } from "react-redux";
export function OptionInputRadio({
  optionId,
  questionId,
  optionLabel,
  isSelected,
  inputHandler,
}) {
  return (
    <div key={optionId} className="mt-2">
      <label
        key={optionId}
        className={
          "d-inline-flex align-items-center radio question-answer question-answer-enabled px-3 py-2 " +
          (isSelected ? "answer-selected" : "")
        }
      >
        <input
          id={`question-${questionId}-answer-${optionId}`}
          className="custom-answer"
          type="radio"
          name={"answer_" + questionId}
          value={optionId}
          onClick={inputHandler}
          onChange={() => console.log('changed answer')}
          checked={isSelected}
        />
        {/* <span className="is-size-5">{optionLabel}</span> */}
        <div className="ml-1 is-flex is-flex-direction-column">
          {optionLabel.split("(").map((candidateInfo, index) => (
            (index === 0) ? <span className={"is-size-5"}> {candidateInfo} </span> : 
            <span className={"is-size-6"}> {"(" + candidateInfo} </span>
          ))}
        </div>
      </label>
    </div>
  );
}

function InputRadio({
  addAnswer,
  question,
  questionId,
}) {
  const { include_informal_options } = question;
  const includeInformalAns = include_informal_options;
  const formal_options = question.formal_options;

  let answers = useSelector((state) => state.booth.answers)[questionId];
  answers = answers ? answers : [];

  function handlerInput(event) {
    addAnswer([parseInt(event.target.value)], questionId);
  }
  return (
    <div>
      {formal_options.map((key, index) => {
          return (
            <OptionInputRadio
              optionId={index}
              questionId={questionId}
              optionLabel={key}
              isSelected={answers.includes(index)}
              inputHandler={handlerInput}
            />
          );
      })}
    </div>
  );
}
export default InputRadio;
