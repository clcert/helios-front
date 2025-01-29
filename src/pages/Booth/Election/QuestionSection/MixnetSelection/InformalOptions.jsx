import { useState, useEffect } from "react";

function InformalOption({
    isChecked, setVote, label, id
}){
    return (
      <div>
        <label
          id=""
          className={
            "d-inline-flex align-items-center radio question-answer question-answer-enabled px-3 py-2  " +
            (isChecked ? "answer-selected" : "")
          }
        >
          <input
            className="custom-answer"
            type="radio"
            id={id}
            name={`vote_${id}`}
            checked={isChecked}
            onChange={(event) => setVote(event.target.checked)}
          />
          <span className="is-size-5">{label}</span>
        </label>
      </div>
    )
}

export default function InformalOptions({
    answerSelected, selectAnswers, numOfOptions,
}) {
    const [blankChecked, setBlankChecked] = useState(false)
    const [nullChecked, setNullChecked] = useState(false)

    useEffect(() => {
        if (blankChecked) {
          if (nullChecked) {
            setNullChecked(false)
          }
          selectAnswers(numOfOptions + 1)
        }
    }, [blankChecked]);

    useEffect(() => {
      if (nullChecked) {
        if (blankChecked) {
          setBlankChecked(false)
        }
        selectAnswers(numOfOptions + 2)
      }
    }, [nullChecked]);

    useEffect(() => {
      if (!answerSelected) {
        setNullChecked(false)
        setBlankChecked(false)
      }
    }, [answerSelected]);

    return (
      <div>
        {" "}
        <InformalOption
          isChecked={blankChecked}
          setVote={setBlankChecked}
          label="Voto Blanco"
          id="blank"
        />
        <InformalOption
          isChecked={nullChecked}
          setVote={setNullChecked}
          label="Voto Nulo"
          id="null"
        />
      </div>
    )
}
