import $ from "jquery";
import { HELIOS, UTILS } from "./jscrypto/helios";
import _ from "lodash";
import { BigInt } from "./jscrypto/bigint";
import { b64_sha256 } from "./jscrypto/sha2";
import EncryptedAnswerFactory from "./jscrypto/encypted-answers";
import EncryptedVote from "./jscrypto/encrypted-vote";

window.onbeforeunload = function (evt) {
  if (!BOOTH.started_p) return;

  if (typeof evt === "undefined") {
    evt = window.event;
  }

  var message =
    "If you leave this page with an in-progress ballot, your ballot will be lost.";

  if (evt) {
    evt.returnValue = message;
  }

  return message;
};

class BoothPsifos {
  constructor() {
    this.started_p = false;
    this.templates_setup_p = true;
    this.election = {};
    this.encrypted_answers = [];
    this.encrypted_open_answers = [];
  }

  setup_ballot(election) {
    this.ballot = {};

    // dirty markers for encryption (mostly for async)
    this.dirty = [];

    // each question starts out with an empty array answer
    // and a dirty bit to make sure we encrypt
    this.ballot.answers = [];
    this.election.questions.forEach(
      function (x, i) {
        this.ballot.answers[i] = [];
        this.dirty[i] = true;
      }.bind(this)
    );
  }

  // all ciphertexts to null
  reset_ciphertexts() {
    _(this.encrypted_answers).each(function (enc_answer, ea_num) {
      this.launch_async_encryption_answer(ea_num);
    });
  }

  log(msg) {
    if (typeof console != "undefined") console.log(msg);
  }

  setup_workers(election_raw_json) {
    // async?

    if (!this.synchronous) {
      // prepare spots for encrypted answers
      // and one worker per question
      this.encrypted_answers = [];
      this.answer_timestamps = [];
      this.worker = new Worker(
        new URL("./boothworker-single.worker.js", import.meta.url)
      );
      this.worker.postMessage({
        type: "setup",
        election: election_raw_json,
      });

      this.worker.onmessage = function (event) {
        // logging
        if (event.data.type === "log") return this.log(event.data.msg);

        // result of encryption
        if (event.data.type === "result") {
          // this check ensures that race conditions
          // don't screw up votes.
          if (event.data.id === this.answer_timestamps[event.data.q_num]) {
            this.encrypted_answers[event.data.q_num] =
              EncryptedAnswerFactory.fromJSONObject(event.data, this.election);
            this.log("got encrypted answer " + event.data.q_num);
          } else {
            this.log("no way jose");
          }
        }
      }.bind(this);

      this.election.questions.forEach((question, q_num) => {
        this.encrypted_answers[q_num] = null;
      });
    }
  }

  setup_election(raw_json, election_metadata) {
    // IMPORTANT: we use the raw JSON for safer hash computation
    // so that we are using the JSON serialization of the SERVER
    // to compute the hash, not the JSON serialization in JavaScript.
    // the main reason for this is unicode representation: the Python approach
    // appears to be safer.
    this.election = HELIOS.Election.fromJSONString(raw_json);

    // FIXME: we shouldn't need to set both, but right now we are doing so
    // because different code uses each one. Bah. Need fixing.
    this.election.hash = b64_sha256(raw_json);
    this.election.election_hash = this.election.hash;

    // async?
    this.setup_workers(raw_json);

    document.title = "Participa UChile - " + this.election.short_name;

    // escape election fields
    // let escaped_array = ["description", "name"]
    // escaped_array.forEach(function (i, field) {
    //   this.election[field] = this.escape_html(this.election[field]);
    // });

    // TODO: escape question and answers

    // whether the election wants candidate order randomization or not
    // we set up an ordering array so that the rest of the code is
    // less error-prone.
    this.election.question_answer_orderings = [];
    this.election.questions.forEach(
      function (question, i) {
        var ordering = new Array(question.formal_options.length);

        // initialize array so it is the identity permutation
        ordering.forEach(function (answer, j) {
          ordering[j] = j;
        });

        // if we want reordering, then we shuffle the array
        if (election_metadata && election_metadata.randomize_answer_order) {
          this.shuffleArray(ordering);
        }

        this.election.question_answer_orderings[i] = ordering;
      }.bind(this)
    );
    this.setup_ballot();
  }

  show = function (el) {
    el.show();
    return el;
  };

  launch_async_encryption_answer = function (question_num) {
    this.answer_timestamps[question_num] = new Date().getTime();
    this.encrypted_answers[question_num] = null;
    this.encrypted_open_answers[question_num] = null;
    this.dirty[question_num] = false;
    this.worker.postMessage({
      type: "encrypt",
      q_num: question_num,
      q_type: this.election.questions[question_num].type,
      answer: this.ballot.answers[question_num],
      open_answer: this.ballot.open_answers[question_num],
      id: this.answer_timestamps[question_num],
    });
  };

  // check if the current question is ok
  validate_question = function (question_num) {
    // if we need to launch the worker, let's do it
    if (!this.synchronous) {
      // we need a unique ID for this to ensure that old results
      // don't mess things up. Using timestamp.
      // check if dirty
      if (this.dirty[question_num]) {
        this.launch_async_encryption_answer(question_num);
      }
    }
    return true;
  };

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffleArray(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  show_encryption_message_before = function (func_to_execute) {
    func_to_execute();
  };

  so_lets_go = function () {
    this.hide_progress();

    //this.setup_templates();

    // election URL
    //var election_url = $.query.get("election_url");
    let election_url = null;
    this.load_and_setup_election(election_url);
  };

  ready_p = false;

  _after_ballot_encryption() {
    // if already serialized, use that, otherwise serialize
    this.encrypted_vote_json =
      this.encrypted_ballot_serialized ||
      JSON.stringify(this.encrypted_ballot.toJSONObject());

    var do_hash = function () {
      this.encrypted_ballot_hash = b64_sha256(this.encrypted_vote_json); // this.encrypted_ballot.get_hash();
      //window.setTimeout(show_cast, 0);
    }.bind(this);
    window.setTimeout(do_hash, 0);
  }
  percentageDone = 0;
  total_cycles_waited = 0;

  // wait for all workers to be done
  wait_for_ciphertexts = function () {
    this.total_cycles_waited += 1;
    var answers_done = _.reject(this.encrypted_answers, _.isNull);
    var percentage_done = Math.round(
      (100 * answers_done.length) / this.encrypted_answers.length
    );
    if (percentage_done < 100) {
      setTimeout(this.wait_for_ciphertexts, 500);
      return;
    }
    this.encrypted_ballot = EncryptedVote.fromEncryptedAnswers(
      this.election,
      this.encrypted_answers
    );
    this._after_ballot_encryption();
  }.bind(this);

  seal_ballot_raw = function () {
    if (this.synchronous) {
      this.progress = new UTILS.PROGRESS();
      var progress_interval = setInterval(this.check_encryption_status, 500);
      this.encrypted_ballot = EncryptedVote(
        this.election,
        this.ballot.answers,
        this.progress
      );
      clearInterval(progress_interval);
      this._after_ballot_encryption();
    } else {
      this.total_cycles_waited = 0;
      this.wait_for_ciphertexts();
    }
  }.bind(this);

  request_ballot_encryption = function () {
    $.post(
      this.election_url + "/encrypt-ballot",
      { answers_json: $.toJSON(this.ballot.answers) },
      function (result) {
        //this.encrypted_ballot = HELIOS.EncryptedVote.fromJSONObject($.secureEvalJSON(result), this.election);
        // rather than deserialize and reserialize, which is inherently slow on browsers
        // that already need to do network requests, just remove the plaintexts

        this.encrypted_ballot_with_plaintexts_serialized = result;
        var ballot_json_obj = $.secureEvalJSON(
          this.encrypted_ballot_with_plaintexts_serialized
        );
        var answers = ballot_json_obj.answers;
        for (var i = 0; i < answers.length; i++) {
          delete answers[i]["answer"];
          delete answers[i]["randomness"];
        }

        this.encrypted_ballot_serialized = JSON.stringify(ballot_json_obj);

        window.setTimeout(this._after_ballot_encryption, 0);
      }
    );
  };

  seal_ballot = function () {
    // TODO: Queremos hacer la crypto en el sv??
    // if we don't have the ability to do crypto in the browser,
    // we use the server
    if (!BigInt.in_browser) {
      this.show_encryption_message_before(this.request_ballot_encryption, true);
    } else {
      this.show_encryption_message_before(this.seal_ballot_raw, true);
    }
  };

  audit_ballot = function () {
    this.audit_trail =
      this.encrypted_ballot_with_plaintexts_serialized ||
      $.toJSON(this.encrypted_ballot.get_audit_trail());

    this.show($("#audit_div")).processTemplate({
      audit_trail: this.audit_trail,
      election_url: this.election_url,
    });
  };

  cast_ballot = function () {
    // show progress spinner

    // at this point, we delete the plaintexts by resetting the ballot
    this.setup_ballot(this.election);

    // clear the plaintext from the encrypted
    if (this.encrypted_ballot) this.encrypted_ballot.clearPlaintexts();

    this.encrypted_ballot_serialized = null;
    this.encrypted_ballot_with_plaintexts_serialized = null;

    // remove audit trail
    this.audit_trail = null;

    // we're ready to leave the site
    this.started_p = false;
  };
}

export let BOOTH = new BoothPsifos();
