import { answersRestrictionText } from '../utils.js'
import { isSTVQuestion } from '../../../../../utils.js';

function urlifyDescription(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>';
  })
}

function Description ({description}) {
  const description_with_url = urlifyDescription(description)
  return (
    description && (
      <p
        dangerouslySetInnerHTML={{ __html: description_with_url }}
        className="subtitle is-italic"
      />
    )
  )
}

function QuestionNumber ({
  currentQuestion, totalQuestions
}) {
  return (
    <p className="subtitle is-italic mb-0">
      {
        "Pregunta " + currentQuestion +
        " de " + totalQuestions
      }
    </p>
  )
}

function Title({title}) {
  return (
    <p className="title is-4 has-text-black pt-6">
      {title}
    </p>
  )
}

function Restriction ({
  min_answers, max_answers, type,
}) {
  const init = isSTVQuestion(type) ? "ordenar" : undefined
  const restriction = answersRestrictionText(
    min_answers, max_answers, init
  )
  return (
    <p className="subtitle is-italic">
      {"(" + restriction + ")" }
    </p>
  )
}

function QuestionHeader({
  questions, actualQuestion, totalQuestions,
}) {
  const {
    min_answers, max_answers,
    description, title,
    type,
  } = questions

  return (
    <div>
      <QuestionNumber
        currentQuestion={actualQuestion + 1}
        totalQuestions={totalQuestions}
      />
      <Title
        title={title}
      />
      <Restriction
        min_answers={min_answers}
        max_answers={max_answers}
        type={type}
      />
      <Description
        description={description}
      />
    </div>
  );
}

export default QuestionHeader;
