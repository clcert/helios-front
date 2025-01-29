import {
  useState, useCallback, useEffect
} from "react";
import { useSelector } from "react-redux";
import FormalOptions from "./FormalOptions";
import InformalOptions from "./InformalOptions";

function MixnetSelection({ question, addAnswer, numQuestion }) {
  const isGrouped = question.grouped_options;
  const otherOptionsName = "Otras Candidaturas";

  const {
    max_answers: maxAnswers,
  } = question
  let answers = useSelector(
    (state) => state.booth.answers
  )[numQuestion] || [];

  const formal_options = question.formal_options;
  const numOfOptions = formal_options.length

  /** @state {array} array with options for react-select */
  const [candidaturesObjs, setCandidaturesObjs] = useState([]);
  /** @state {array} array with answers selected */
  const [formalAnswersSelected, setFormalAnswersSelected] = useState([]);

  // guarda false, id nulo o id blanco
  const [informalAnswersSelected, setInformalAnswersSelected] = useState(0);

  const includeBlankNull = question.include_informal_options;
  const addAnswerCallback = useCallback(addAnswer, [addAnswer]);

  const changeAllEncrypted = useCallback(
    (number) => {
      let auxAnswersForEncrypt = [];
      for (let i = 0; i < maxAnswers; i++) {
        auxAnswersForEncrypt.push(number);
      }
      addAnswerCallback(auxAnswersForEncrypt, numQuestion);
      return auxAnswersForEncrypt
    },
    [addAnswerCallback, numQuestion, question]
  );

  const initComponent = useCallback(() => {
    const auxAnswersForEncrypt = changeAllEncrypted(
      numOfOptions + 1
    );
    const auxOptions = [];
    formal_options.forEach((close_option, index) => {
      if (
        includeBlankNull &&
        (close_option === "Voto Blanco" || close_option === "Voto Nulo")
      )
        return;
      if (!isGrouped) {
        const optionValue = {
          value: close_option,
          label: close_option,
          key: index,
        };
        auxOptions.push(optionValue);
      } else {
        const optionSplit = close_option.split(",");
        const value = optionSplit[0];
        const group = optionSplit[1] ? optionSplit[1] : otherOptionsName;
        const optionValue = {
          value: value,
          label: value,
          key: index,
          group: group,
        };
        const indexGroup = auxOptions.find((object) => object.label === group);
        if (!indexGroup) {
          optionValue.position = 0;
          auxOptions.push({
            label: group,
            options: [optionValue],
          });
        } else {
          optionValue.position = indexGroup.options.length;
          indexGroup.options.push(optionValue);
        }
      }
    });
    moveToFinal(auxOptions, (element) => element.label === otherOptionsName);
    setCandidaturesObjs(auxOptions);
    addAnswerCallback(auxAnswersForEncrypt, numQuestion);
  }, [
    addAnswerCallback,
    changeAllEncrypted,
    includeBlankNull,
    isGrouped,
    numQuestion,
    formal_options,
  ]);

  useEffect(() => {
    initComponent();
  }, []);

  const moveToFinal = function (array, condition) {
    const indice = array.findIndex(condition);

    if (indice !== -1) {
      const elemento = array.splice(indice, 1)[0];
      array.push(elemento);
    }
  };

  const selectFormalAnswers = useCallback(
    (event, index) => {
      /**
       * Select answers disabling the option
       * Eneabling previous option
       * @param {event} event of selector
       * @param {index} index answers
       */
      let auxOptions = [...candidaturesObjs];
      let auxAnswersSelected = [...formalAnswersSelected];
      let auxAnswersForEncrypt = [...answers];

      let previousSelected = auxAnswersSelected[index];
      let actualSelected = event;

      if (informalAnswersSelected) {
        setInformalAnswersSelected(false)
        auxAnswersForEncrypt = [...changeAllEncrypted(
          numOfOptions
        )];
      }
      auxAnswersSelected[index] = event;
      auxAnswersForEncrypt[index] = actualSelected.key + 1;

      if (previousSelected) {
        previousSelected.isDisabled = false;
      }
      actualSelected.isDisabled = true;

      if (isGrouped) {
        auxOptions.forEach((option) => {
          if (option.label === actualSelected.group) {
            option.options[actualSelected.position] = actualSelected;
          }
          if (previousSelected && option.label === previousSelected.group) {
            option.options[previousSelected.position] = previousSelected;
          }
        });
      } else {
        auxOptions[actualSelected.key] = actualSelected;
        if (previousSelected) {
          auxOptions[previousSelected.key] = previousSelected;
        }
      }
      setFormalAnswersSelected(auxAnswersSelected);
      addAnswerCallback(auxAnswersForEncrypt, numQuestion);
      setCandidaturesObjs(auxOptions);
    },
    [
      answers,
      formalAnswersSelected,
      informalAnswersSelected,
      candidaturesObjs,
      addAnswerCallback,
      isGrouped,
      changeAllEncrypted,
      question,
      numQuestion,
    ]
  );

  function resetSelectedFormalAnswers() {
    /**
     * Delete the selected formal options
     */

    let auxOptions = [...candidaturesObjs];
    formalAnswersSelected.forEach((answerSelected) => {
      if (isGrouped) {
        auxOptions.forEach((option) => {
          if (option.label === answerSelected.group) {
            answerSelected.isDisabled = false;
            option.options[answerSelected.position] = answerSelected;
          }
        });
      } else {
        let newAnswer = auxOptions[answerSelected.key];
        newAnswer.isDisabled = false;
        auxOptions[answerSelected.key] = newAnswer;
      }
    });
    setFormalAnswersSelected([]);
    setCandidaturesObjs(auxOptions);
  }

  return (
    <div>
      <FormalOptions
        answerIndexes={[...Array(parseInt(maxAnswers)).keys()]}
        answersSelected={formalAnswersSelected}
        options={candidaturesObjs}
        selectAnswers={selectFormalAnswers}
        isGrouped={isGrouped}
      />
      {includeBlankNull && (
        <InformalOptions
          answerSelected={informalAnswersSelected}
          selectAnswers={(informalId) => {
            setInformalAnswersSelected(informalId)
            if (formalAnswersSelected.length !== 0) {
              resetSelectedFormalAnswers();
            }
            const newAns = changeAllEncrypted(informalId);
            addAnswerCallback(newAns, numQuestion);
          }}
          numOfOptions={numOfOptions}
        />
      )}
    </div>
  );
}

export default MixnetSelection;
