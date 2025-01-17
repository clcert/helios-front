import { ElGamal } from "./elgamal";
import { UTILS } from "./helios";
import { b64_sha256 } from "./sha2";

import EncryptedAnswerFactory from "./encypted-answers";
var _ = require("lodash");

class EncryptedVote {
  constructor(election, answers, progress) {
    // empty constructor
    if (election == null) return;


    // keep information about the election around
    this.short_name = election.short_name;
    this.election_hash = election.get_hash();
    this.election = election;

    if (answers == null) return;

    var n_questions = election.questions.length;
    this.encrypted_answers = [];

    if (progress) {
      // set up the number of ticks
      _(election.questions).each(function (q, q_num) {
        // + 1 for the overall proof
        progress.addTicks(q.answers.length);
        if (q.max != null) progress.addTicks(q.max);
      });

      progress.addTicks(0, n_questions);
    }

    // loop through questions
    for (var i = 0; i < n_questions; i++) {
      this.encrypted_answers[i] = new EncryptedAnswerFactory.create(
        election.questions[i].q_type,
        election.questions[i],
        answers[i],
        election.public_key,
        progress,
      );
    }
  }
  toString() {
    // for each question, get the encrypted answer as a string
    var answer_strings = _(this.encrypted_answers).map(function (a) {
      return a.toString();
    });

    return answer_strings.join("//");
  }

  clearPlaintexts() {
    _(this.encrypted_answers).each(function (ea) {
      ea.clearPlaintexts();
    });
  }

  verifyEncryption(questions, pk) {
    var overall_result = true;
    _(this.encrypted_answers).each(function (ea, i) {
      overall_result = overall_result && ea.verifyEncryption(questions[i], pk);
    });
    return overall_result;
  }
  toJSONObject(include_plaintext) {
    var answers = _(this.encrypted_answers).map(function (ea, i) {
      return ea.toJSONObject(include_plaintext);
    });

    return {
      answers: answers,
      short_name: this.short_name,
    };
  }

  get_hash() {
    return b64_sha256(JSON.stringify(this.toJSONObject()));
  }

  get_audit_trail() {
    return this.toJSONObject(true);
  }

  verifyProofs(pk, outcome_callback) {
    var zero_or_one = UTILS.generate_plaintexts(pk, 0, 1);

    var VALID_P = true;

    var self = this;

    // for each question and associate encrypted answer
    _(this.encrypted_answers).each(function (enc_answer, ea_num) {
      var overall_result = 1;

      // the max number of answers (decides whether this is approval or not and requires an overall proof)
      var max = self.election.questions[ea_num].max;

      // go through each individual proof
      _(enc_answer.choices).each(function (choice, choice_num) {
        var result = choice.verifyDisjunctiveProof(
          zero_or_one,
          enc_answer.individual_proofs[choice_num],
          ElGamal.disjunctive_challenge_generator
        );
        outcome_callback(ea_num, choice_num, result, choice);

        VALID_P = VALID_P && result;

        // keep track of homomorphic product, if needed
        if (max != null) overall_result = choice.multiply(overall_result);
      });

      if (max != null) {
        // possible plaintexts [0, 1, .. , question.max]
        var plaintexts = UTILS.generate_plaintexts(
          pk,
          self.election.questions[ea_num].min,
          self.election.questions[ea_num].max
        );

        // check the proof on the overall product
        var overall_check = overall_result.verifyDisjunctiveProof(
          plaintexts,
          enc_answer.overall_proof,
          ElGamal.disjunctive_challenge_generator
        );
        outcome_callback(ea_num, null, overall_check, null);
        VALID_P = VALID_P && overall_check;
      } else {
        // check to make sure the overall_proof is null, since it's approval voting
        VALID_P = VALID_P && enc_answer.overall_proof == null;
      }
    });

    return VALID_P;
  }
}

EncryptedVote.fromJSONObject = function (d, election) {
  if (d == null) return null;

  var ev = new EncryptedVote(election);

  ev.encrypted_answers = _(d.answers).map(function (ea) {
    return EncryptedAnswerFactory.fromJSONObject(ea, election);
  });

  ev.election_hash = d.election_hash;
  ev.short_name = d.short_name;

  return ev;
};

// create an encrypted vote from a set of answers
EncryptedVote.fromEncryptedAnswers = function (election, enc_answers) {
  var enc_vote = new EncryptedVote(election, null);
  enc_vote.encrypted_answers = [];
  _(enc_answers).each(function (enc_answer, answer_num) {
    enc_vote.encrypted_answers[answer_num] = enc_answer;
  });
  return enc_vote;
};

export default EncryptedVote;
