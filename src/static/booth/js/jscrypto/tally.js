import { ElGamal } from "./elgamal";

var _ = require("lodash");

class TallyFactory {
  /**
   * Class factory for creating a tally object.
   */

  create(tally_type, computed, num_tallied, public_key, question, raw_tally) {
    const tally_types_obj = {
      "HOMOMORPHIC": HomomorphicTally,
      "MIXNET": MixnetTally,
      "STVNC": MixnetTally,
    };

    return Object.keys(tally_types_obj).includes(tally_type) && new tally_types_obj[tally_type](
      computed,
      num_tallied,
      public_key,
      question,
      raw_tally
    );
  }
}

class Tally {
  /**
   * Abstract class for tally objects.
   * @param {string} computed - the computed value of the tally
   * @param {number} num_tallied - number of tally
   * @param {PublicKey} public_key - election public key
   * @param {Question} question - election question
   * @param {array} raw_tally - the raw tally data
   */

  constructor(computed, num_tallied, public_key, question, raw_tally) {
    this.computed = computed;
    this.num_tallied = num_tallied;
    this.public_key = public_key;
    this.question = question;
    this.tally = raw_tally;
  }

  toJSONObject() {
    /**
     * Returns the JSON object representing this tally.
     * @return {object}
     */

    let tally_json_obj = _(this.tally).map(function (one_q) {
      return _(one_q).map(function (one_a) {
        return one_a.toJSONObject();
      });
    });

    return {
      num_tallied: this.num_tallied,
      tally: tally_json_obj,
    };
  }
}

class HomomorphicTally extends Tally {
  /**
   * Class for homomorphic tallies.
   */

  constructor(computed, num_tallied, public_key, question, tally) {
    let tally_object = tally.map(function (one_q) {
      return ElGamal.Ciphertext.fromJSONObject(one_q, public_key);
    });

    super(computed, num_tallied, public_key, question, tally_object);
    this.tally_type = "homomorphic";
  }

  doDecrypt(public_key, secret_key) {
    /**
     * Decrypts the tally.
     * @param {PublicKey} public_key - election public key
     * @param {SecretKey} secret_key - trustee secret key
     * @return {Tally}
     */

    // initialize the arrays
    var decryption_factors = [];
    var decryption_proofs = [];

    // decrypt the tallies

    this.tally.forEach(function (choice_tally, choice_num) {
      var one_choice_result = secret_key.decryptionFactorAndProof(
        choice_tally,
        ElGamal.fiatshamir_challenge_generator
      );

      decryption_factors[choice_num] =
        one_choice_result.decryption_factor.toString();
      decryption_proofs[choice_num] =
        one_choice_result.decryption_proof.toJSONObject();
    });

    return {
      tally_type: this.tally_type,
      decryption_factors: decryption_factors,
      decryption_proofs: decryption_proofs,
    };
  }
}

class MixnetTally extends Tally {
  /**
   * Class for homomorphic tallies.
   */

  constructor(computed, num_tallied, public_key, question, tally) {
    let tally_object = tally.map((q_answer) => {
      return q_answer.map((one_q) => {
        return ElGamal.Ciphertext.fromJSONObject(one_q, public_key);
      });
    });


    super(computed, num_tallied, public_key, question, tally_object);
    this.tally_type = "mixnet";
  }
  doDecrypt(public_key, secret_key) {
    /**
     * Decrypts the tally.
     * @param {PublicKey} public_key - election public key
     * @param {SecretKey} secret_key - trustee secret key
     * @return {Tally}
     */

    // initialize the arrays
    var decryption_factors = [];
    var decryption_proofs = [];

  
    this.tally.forEach((one_tally, vote_number) => {
      let one_factor = [];
      let one_proof = [];

      // decrypt the tallie of vote
      one_tally.forEach(function (choice_tally, choice_num) {
        var one_choice_result = secret_key.decryptionFactorAndProof(
          choice_tally,
          ElGamal.fiatshamir_challenge_generator
        );

        one_factor[choice_num] = one_choice_result.decryption_factor.toString();
        one_proof[choice_num] =
          one_choice_result.decryption_proof.toJSONObject();
      });

      // add factor and proof of vote to the final array
      decryption_factors[vote_number] = one_factor;
      decryption_proofs[vote_number] = one_proof;
    });

    return {
      tally_type: this.tally_type,
      decryption_factors: decryption_factors,
      decryption_proofs: decryption_proofs,
    };
  }
}

Tally.fromJSONObject = function (json_tallies, public_key) {
  /**
   * Create a tally object from a JSON object.
   * @param {Object} json_tallies - a JSON with tallies
   * @param {PublicKey} public_key - election public key
   */

  return new TallyFactory().create(
    json_tallies.tally_type,
    json_tallies.computed,
    json_tallies.num_tallied,
    json_tallies.public_key,
    json_tallies.question,
    json_tallies.encrypted_tally
  );
};

Tally.createAllTally = function (array_tally, public_key) {
  /**
   * Create a tally object from an array of tallies.
   * @param {Array} array_tally - an array of tallies
   * @param {PublicKey} public_key - election public key
   */
  return Tally.fromJSONObject(array_tally , public_key) 
};

export default Tally;
