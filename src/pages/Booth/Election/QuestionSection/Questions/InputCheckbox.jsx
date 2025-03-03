import { useSelector } from "react-redux";

function InputCheckbox(props) {
  let answers = useSelector((state) => state.booth.answers)[props.index];
  answers = answers ? answers : [];
  const includeBlankNull = props.question.include_blank_null;
  const excludeGroups = props.question.excluding_groups;

  const getGroup = (ans) => {
    const regex = /\((.*?)\)/;
    const group = ans.match(regex);
    return group ? group[1] : null;
  };

  const closed_options = props.question.closed_options_list;

  const disabledCondition = (index) => {
    return (
      parseInt(props.question.max_answers) === answers.length &&
      !answers.includes(index)
    );
  };

  function addAnswer(event, index) {
    let value = parseInt(event.target.value);
    let answersAux = [...answers];

    const questionsLength = closed_options.length;
    if (
      includeBlankNull &&
      (answersAux.includes(questionsLength - 2) ||
        answersAux.includes(questionsLength - 1))
    ) {
      answersAux = [];
    }
    if (event.target.checked && !answers.includes(value)) {
      answersAux.push(value);
    } else if (!event.target.checked && answers.includes(value)) {
      answersAux.splice(answersAux.indexOf(value), 1);
    }
    return answersAux;
  }

  const excludeGroupsDisabled = (value) => {
    const group = getGroup(value);
    return answers.some((ans) => {
      return getGroup(props.question.closed_options_list[ans]) === group;
    });
  };
  return (
    <div>
      {closed_options.map((key, index) => {
        if (
          !includeBlankNull ||
          index < props.question.closed_options_list.length - 2
        ) {
          const isDisabled = disabledCondition(index);
          return (
            <div key={index} className={"mt-2 "}>
              <label
                className={
                  (isDisabled
                    ? "question-answer-desabled "
                    : "question-answer-enabled ") +
                  "d-inline-flex align-items-center checkbox question-answer px-3 py-2 " +
                  (answers.includes(index) ? "answer-selected" : "")
                }
              >
                <input
                  id={`question-${props.index}-answer-${index}`}
                  type="checkbox"
                  className="custom-answer"
                  name={"answer_" + index}
                  value={index}
                  checked={answers.includes(index) || false}
                  onChange={(e) => {
                    let ans = addAnswer(e, props.index);
                    props.addAnswer(ans, props.index);
                  }}
                  disabled={
                    isDisabled || excludeGroups
                      ? (excludeGroupsDisabled(key) && !answers.includes(index))
                      : false
                  }
                />
                <div className="ml-1 is-flex is-flex-direction-column">
                  {key.split("(").map((candidateInfo, index) => (
                    (index === 0) ? <span className={"is-size-5"}> {candidateInfo} </span> : 
                    <span className={"is-size-6"}> {"(" + candidateInfo} </span>
                  ))}
                </div>
              </label>
            </div>
          );
        } else return null;
      })}
    </div>
  );
}

export default InputCheckbox;
