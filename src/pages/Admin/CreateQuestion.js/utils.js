import { backendOpIP } from "../../../server";
import { informalOptions } from "../../../constants";

// CREATE QUESTION INTERFACE
export const parseSavedQuestionList = (questions) => questions.map((question, index) => ({
    index: index,
    type: question.type ?? "CLOSED",
    title: question.title ?? "",
    description: question.description ?? "",
    formal_options: question.formal_options ?? [],
      options_specifications: question.options_specifications ?? [],
    open_option_max_size: question.open_option_max_size ?? 50,
    total_open_options: question.total_open_options ?? 0,
    num_of_winners: question.num_of_winners ?? 1,
    min_answers: question.min_answers ?? 1,
    max_answers: question.max_answers ?? 1,
    include_informal_options: question.include_informal_options,
    excluded_options: question.excluded_options,
    grouped_options: question.grouped_options
}))

export const getDefaultQuestion = (q_num) => ({
    index: q_num,
    type: "CLOSED",
    title: "",
    description: "",
    formal_options: [],
    options_specifications: [],
    open_option_max_size: 50,
    total_open_options: 0,
    num_of_winners: 1,
    min_answers: 1,
    max_answers: 1,
    include_informal_options: true,
    excluded_options: false,
    grouped_options: false,
})

export const postQuestionList = async (
  shortName, newQuestionList, handleSuccess, handleError
) => {
  const token = localStorage.getItem("token");
  const resp = await fetch(backendOpIP + "/create-questions/" + shortName, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: newQuestionList,
    }),
  });
  if (resp.status === 200) {
    handleSuccess()
  } else {
    handleError(resp)
  }
}

export const isNotEmpty = (alert) => alert !== ""

// QUESTION CARD UTILS
export const generateClosedOptions = (
  includeInformal, ansList
) => includeInformal
? [...ansList, ...informalOptions] : ansList;

export const getListFromObjects = (arrayWithKeys) => {
  let auxAnswers = [];
  for (let i = 0; i < arrayWithKeys.length; i++) {
    auxAnswers[i] = arrayWithKeys[i].value;
  }
  return auxAnswers;
}
