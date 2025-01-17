import InputCheckbox from "./Questions/InputCheckbox";
import InputRadio from "./Questions/InputRadio";
import { permanentOptions } from "../../../../constants";
import { useSelector } from "react-redux";

function InputSelection(props) {

  const formal_options = props.question.formal_options;

  let answers = useSelector((state) => state.booth.answers)[props.index];
  answers = answers ? answers : [];

  const isMultipleSelection =
    props.question.min_answers === 1 && props.question.max_answers === 1;

  const nullValue = formal_options.length + 1;
  const blankValue = formal_options.length;
  const includeBlankNull = props.question.include_informal_options;

  const { whiteOptionText, nullOptionText } = permanentOptions;

  function nullVote(event) {
    if (event.target.checked) {
      const value = parseInt(event.target.value);
      props.addAnswer([value], props.index);
    } else {
      props.addAnswer([], props.index);
    }
  }

  function blankVote(event) {
    if (event.target.checked) {
      const value = parseInt(event.target.value);
      props.addAnswer([value], props.index);
    } else {
      props.addAnswer([], props.index);
    }
  }

  return (
    <div>
      <div>
        {isMultipleSelection ? (
          <InputRadio
            questionId={props.index}
            election={props.election}
            question={props.question}
            addAnswer={props.addAnswer}
            value={String(props.index)}
          />
        ) : (
          <InputCheckbox
            index={props.index}
            election={props.election}
            question={props.question}
            addAnswer={props.addAnswer}
            value={String(props.index)}
          />
        )}
      </div>

      {includeBlankNull && (
        <>
          {" "}
          <div className="mt-2">
            <label
              className={
                "d-inline-flex align-items-center radio question-answer question-answer-enabled px-3 py-2 " +
                (answers.includes(blankValue) ? "answer-selected" : "")
              }
            >
              <input
                className="custom-answer"
                type={isMultipleSelection ? "radio" : "checkbox"}
                id="white"
                value={blankValue}
                name={"answer_" + props.index}
                checked={answers.includes(blankValue)}
                onChange={(event) => {
                  blankVote(event);
                }}
              />
              <span className="is-size-5 ml-1"> {whiteOptionText} </span>
            </label>
          </div>
          <div className="mt-2">
            <label
              className={
                "d-inline-flex align-items-center radio question-answer question-answer-enabled px-3 py-2 " +
                (answers.includes(nullValue) ? "answer-selected" : "")
              }
            >
              <input
                className="custom-answer"
                type={isMultipleSelection ? "radio" : "checkbox"}
                id="null"
                value={nullValue}
                name={"answer_" + props.index}
                checked={answers.includes(nullValue)}
                onChange={(event) => {
                  nullVote(event);
                }}
              />
              <span className="is-size-5 ml-1"> {nullOptionText} </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

export default InputSelection;
