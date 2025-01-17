/*
 * JavaScript HTML 5 Worker for BOOTH
 */

// import needed resources
import { HELIOS } from "./jscrypto/helios";
import { BigInt } from "./jscrypto/bigint";
import { ElGamal } from "./jscrypto/elgamal";
import { UTILS } from "./jscrypto/helios";
import EncryptedAnswerFactory from "./jscrypto/encypted-answers";

var console = {
  log: function (msg) {
    postMessage({ type: "log", msg: msg });
  },
};

var ELECTION = null;

function do_setup(message) {
  console.log("setting up worker");

  ELECTION = HELIOS.Election.fromJSONString(message.election);
}

function generateExcludedProofs(answers, indexesMarked, choices, randomness) {
  let groups = {};
  const regExp = /\(([^)]+)\)/;
  answers.forEach((item, index) => {
    const aux = regExp.exec(item);

    if (aux != null) {
      if (groups[aux[1]]) {
        groups[aux[1]].push(index);
      } else {
        groups[aux[1]] = [index];
      }
    }
  });
  let ciphertexts = {};
  let joint_randomness = {};
  for (let group in groups) {

    if(groups[group].length === 1){
      continue;
    }

    ciphertexts[group] = 1;
    joint_randomness[group] = BigInt.ZERO;
    for (let i = 0; i < groups[group].length; i++) {
      let index = groups[group][i];
      let ct = choices[index];
      // let ct = ElGamal.Ciphertext.fromJSONObject(choices[index], ELECTION.public_key);
      ciphertexts[group] = ct.multiply(ciphertexts[group]);
      let r = BigInt.fromInt(randomness[index]);
      joint_randomness[group] = r
        .add(joint_randomness[group])
        .mod(ELECTION.public_key.q);
    }
  }
  let excludedProofs = [];
  let j = 0;
  for (let group in groups) {

    if(groups[group].length === 1){
      excludedProofs[j] = [];
      j += 1;
      continue;
    }

    const zero_one_plaintexts = UTILS.generate_plaintexts(
      ELECTION.public_key,
      0,
      1
    );
    let plaintext_index = 0;
    for (let i = 0; i < indexesMarked.length; i++) {
      let indexMarked = indexesMarked[i];
      if (groups[group].includes(Number(indexMarked))) {
        plaintext_index = BigInt.ONE;
      }
    }
    excludedProofs[j] = ciphertexts[group]
      .generateDisjunctiveProof(
        zero_one_plaintexts,
        plaintext_index,
        joint_randomness[group],
        ElGamal.disjunctive_challenge_generator
      )
      .toJSONObject();
    j += 1;
  }
  return excludedProofs;
}

function do_encrypt(message) {
  console.log(
    "encrypting answer for question " + ELECTION.questions[message.q_num]
  );

  let data = {
    type: "result",
    q_num: message.q_num,
    id: message.id,
    q_type: message.q_type,
  };

  console.log("EMPIEZA A ENCRIPTAR");
  var encrypted_answer = new EncryptedAnswerFactory().create(
    message.q_type,
    ELECTION.questions[message.q_num],
    message.answer,
    ELECTION.public_key
  );
  data.short_name = ELECTION.questions[message.q_num].short_name;
  data.encrypted_answer = encrypted_answer.toJSONObject(true);
  const excluding_groups =
    ELECTION.questions[message.q_num].excluding_groups === "True";
  if (excluding_groups) {
    const excludedProofs = generateExcludedProofs(
      ELECTION.questions[message.q_num].closed_options,
      message.answer,
      encrypted_answer.choices,
      encrypted_answer.randomness
    );
    data.excluded_proofs = excludedProofs;
    
  }

  let encrypted_open_answer = null;
  if (message.q_type === "open_question") {
    data.enc_ans_type = "encrypted_open_answer";
    console.log("encrypting open answer for question " + message.q_num);
    let encrypt_open_answer = (answer) => {
      console.log("ANSWER: -" + answer + "-");

      let from_bytearray_to_hexstring = (byteArray) => {
        return Array.from(byteArray, (byte) => {
          return ("0" + (byte & 0xff).toString(16)).slice(-2);
        }).join("");
      };

      let answer_bytearray =
        answer !== "" ? new TextEncoder().encode(answer) : [0];
      let hexstring_answer = from_bytearray_to_hexstring(answer_bytearray);
      console.log("BYTEARRAY: " + answer_bytearray);
      console.log(
        "HEXSTRING: " + from_bytearray_to_hexstring(answer_bytearray)
      );

      let answer_bi = new BigInt(hexstring_answer, 16);
      console.log("answer_bi: " + answer_bi.toString());
      let answer_pt = new ElGamal.Plaintext(
        answer_bi,
        ELECTION.public_key,
        true
      );
      console.log("answer_pt.m: " + answer_pt.m);
      let answer_enc = ElGamal.encrypt(ELECTION.public_key, answer_pt);

      return {
        alpha: answer_enc.alpha.toJSONObject(),
        beta: answer_enc.beta.toJSONObject(),
      };
    };
    encrypted_open_answer = encrypt_open_answer(message.open_answer[0]);
    data.encrypted_open_answer = encrypted_open_answer;
  }

  console.log("done encrypting");

  // send the result back
  postMessage(JSON.parse(JSON.stringify(data)));
}

// receive either
// a) an election and an integer position of the question
// that this worker will be used to encrypt
// {'type': 'setup', 'election': election_json}
//
// b) an answer that needs encrypting
// {'type': 'encrypt', 'q_num': 2, 'id': id, 'answer': answer_json}
//
onmessage = function (event) {
  // dispatch to method
  if (event.data.type === "setup") {
    do_setup(event.data);
  } else if (event.data.type === "encrypt") {
    do_encrypt(event.data);
  }
};
