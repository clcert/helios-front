//
// inspired by George Danezis, rewritten by Ben Adida.
//
import { BigInt } from "./bigint";
import _ from "lodash";
import { Random } from "./random";
import { hex_sha1 } from "./sha1";

/* Simple JavaScript Inheritance
 * By John Resig https://johnresig.com/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

export var ElGamal = {};

class Params {
  constructor(p, q, g, t, l) {
    this.p = p;
    this.q = q;
    this.g = g;
    this.t = parseInt(t);
    this.l = parseInt(l);
  }

  generate() {
    var x = Random.getRandomInteger(this.q);
    var y = this.g.modPow(x, this.p);
    var pk = new PublicKey(this.p, this.q, this.g, y);
    var sk = new SecretKey(x, pk);
    return sk;
  }
  toJSONObject() {
    return {
      g: this.g.toJSONObject(),
      p: this.p.toJSONObject(),
      q: this.q.toJSONObject(),
    };
  }
}

Params.fromJSONObject = function (d) {
  var params = new Params();
  params.p = BigInt.fromJSONObject(d.p);
  params.q = BigInt.fromJSONObject(d.q);
  params.g = BigInt.fromJSONObject(d.g);
  params.t = parseInt(d.t);
  params.l = parseInt(d.l);
  return params;
};
ElGamal.Params = Params;

class PublicKey {
  constructor(p, q, g, y) {
    this.p = p;
    this.q = q;
    this.g = g;
    this.y = y;
  }

  toJSONObject() {
    return {
      g: this.g.toJSONObject(),
      p: this.p.toJSONObject(),
      q: this.q.toJSONObject(),
      y: this.y.toJSONObject(),
    };
  }

  verifyKnowledgeOfSecretKey(proof, challenge_generator) {
    // if challenge_generator is present, we have to check that the challenge was properly generated.
    if (challenge_generator != null) {
      if (!proof.challenge.equals(challenge_generator(proof.commitment))) {
        return false;
      }
    }

    // verify that g^response = s * y^challenge
    var check = this.g
      .modPow(proof.response, this.p)
      .equals(
        this.y
          .modPow(proof.challenge, this.p)
          .multiply(proof.commitment)
          .mod(this.p)
      );

    return check;
  }

  // check if the decryption factor is correct for this public key, given the proof
  verifyDecryptionFactor(
    ciphertext,
    decryption_factor,
    decryption_proof,
    challenge_generator
  ) {
    return decryption_proof.verify(
      this.g,
      ciphertext.alpha,
      this.y,
      decryption_factor,
      this.p,
      this.q,
      challenge_generator
    );
  }

  multiply(other) {
    // base condition
    if (other === 0 || other === 1) {
      return this;
    }

    // check params
    if (!this.p.equals(other.p)) throw new Error("mismatched params");
    if (!this.g.equals(other.g)) throw new Error("mismatched params");

    var new_pk = new ElGamal.PublicKey(
      this.p,
      this.q,
      this.g,
      this.y.multiply(other.y).mod(this.p)
    );
    return new_pk;
  }

  equals(other) {
    return (
      this.p.equals(other.p) &&
      this.q.equals(other.q) &&
      this.g.equals(other.g) &&
      this.y.equals(other.y)
    );
  }
}

PublicKey.fromJSONObject = function (d) {
  var pk = new ElGamal.PublicKey();
  pk.p = BigInt.fromJSONObject(d.p);
  pk.q = BigInt.fromJSONObject(d.q);
  pk.g = BigInt.fromJSONObject(d.g);
  pk.y = BigInt.fromJSONObject(d.y);
  return pk;
};

ElGamal.PublicKey = PublicKey;

class SecretKey {
  constructor(x, pk) {
    this.x = x;
    this.pk = pk;
  }

  toJSONObject() {
    return { public_key: this.pk.toJSONObject(), x: this.x.toJSONObject() };
  }

  // a decryption factor is *not yet* mod-inverted, because it needs to be part of the proof.
  decryptionFactor(ciphertext) {
    var decryption_factor = ciphertext.alpha.modPow(this.x, this.pk.p);
    return decryption_factor;
  }

  decrypt(ciphertext, decryption_factor) {
    if (!decryption_factor)
      decryption_factor = this.decryptionFactor(ciphertext);

    // use the ciphertext's built-in decryption given a list of decryption factors.
    return ciphertext.decrypt([decryption_factor]);
  }

  decryptAndProve(ciphertext, challenge_generator) {
    var dec_factor_and_proof = this.decryptionFactorAndProof(
      ciphertext,
      challenge_generator
    );

    // decrypt, but using the already computed decryption factor
    var plaintext = this.decrypt(
      ciphertext,
      dec_factor_and_proof.decryption_factor
    );

    return {
      plaintext: plaintext,
      proof: dec_factor_and_proof.decryption_proof,
    };
  }

  decryptionFactorAndProof(ciphertext, challenge_generator) {
    var decryption_factor = this.decryptionFactor(ciphertext);

    // the DH tuple we need to prove, given the secret key x, is:
    // g, alpha, y, beta/m
    var proof = ElGamal.Proof.generate(
      this.pk.g,
      ciphertext.alpha,
      this.x,
      this.pk.p,
      this.pk.q,
      challenge_generator
    );

    return {
      decryption_factor: decryption_factor,
      decryption_proof: proof,
    };
  }

  // generate a proof of knowledge of the secret exponent x
  proveKnowledge(challenge_generator) {
    // generate random w
    var w = Random.getRandomInteger(this.pk.q);

    // compute s = g^w for random w.
    var s = this.pk.g.modPow(w, this.pk.p);

    // get challenge
    var challenge = challenge_generator(s);

    // compute response = w +  x * challenge
    var response = w.add(this.x.multiply(challenge)).mod(this.pk.q);

    return new ElGamal.DLogProof(s, challenge, response);
  }
}

SecretKey.fromJSONObject = function (d) {
  var sk = new SecretKey();
  sk.pk = PublicKey.fromJSONObject(d.public_key);
  sk.x = BigInt.fromJSONObject(d.x);
  return sk;
};

ElGamal.SecretKey = SecretKey;

class Ciphertext {
  constructor(alpha, beta, pk) {
    this.alpha = alpha;
    this.beta = beta;
    this.pk = pk;
  }

  toString() {
    return this.alpha.toString() + "," + this.beta.toString();
  }

  toJSONObject() {
    return { alpha: this.alpha.toJSONObject(), beta: this.beta.toJSONObject() };
  }

  multiply(other) {
    // special case if other is 1 to enable easy aggregate ops
    if (other === 1) return this;

    // homomorphic multiply
    return new ElGamal.Ciphertext(
      this.alpha.multiply(other.alpha).mod(this.pk.p),
      this.beta.multiply(other.beta).mod(this.pk.p),
      this.pk
    );
  }

  // a decryption method by decryption factors
  decrypt(list_of_dec_factors) {
    var running_decryption = this.beta;
    var self = this;
    _(list_of_dec_factors).each(function (dec_factor) {
      running_decryption = dec_factor
        .modInverse(self.pk.p)
        .multiply(running_decryption)
        .mod(self.pk.p);
    });

    return new Plaintext(running_decryption, this.pk, false);
  }

  generateProof(plaintext, randomness, challenge_generator) {
    // DH tuple to prove is
    // g, y, alpha, beta/m
    // with dlog randomness
    var proof = ElGamal.Proof.generate(
      this.pk.g,
      this.pk.y,
      randomness,
      this.pk.p,
      this.pk.q,
      challenge_generator
    );

    return proof;
  }

  simulateProof(plaintext, challenge) {
    // compute beta/plaintext, the completion of the DH tuple
    var beta_over_plaintext = this.beta
      .multiply(plaintext.m.modInverse(this.pk.p))
      .mod(this.pk.p);

    // the DH tuple we are simulating here is
    // g, y, alpha, beta/m

    return ElGamal.Proof.simulate(
      this.pk.g,
      this.pk.y,
      this.alpha,
      beta_over_plaintext,
      this.pk.p,
      this.pk.q,
      challenge
    );
  }

  verifyProof(plaintext, proof, challenge_generator) {
    // DH tuple to verify is
    // g, y, alpha, beta/m
    var beta_over_m = this.beta
      .multiply(plaintext.m.modInverse(this.pk.p))
      .mod(this.pk.p);

    return proof.verify(
      this.pk.g,
      this.pk.y,
      this.alpha,
      beta_over_m,
      this.pk.p,
      this.pk.q,
      challenge_generator
    );
  }

  verifyDecryptionProof(plaintext, proof, challenge_generator) {
    // DH tuple to verify is
    // g, alpha, y, beta/m
    // since the proven dlog is the secret key x, y=g^x.
    var beta_over_m = this.beta
      .multiply(plaintext.m.modInverse(this.pk.p))
      .mod(this.pk.p);

    return proof.verify(
      this.pk.g,
      this.alpha,
      this.pk.y,
      beta_over_m,
      this.pk.p,
      this.pk.q,
      challenge_generator
    );
  }

  generateDisjunctiveProof(
    list_of_plaintexts,
    real_index,
    randomness,
    challenge_generator
  ) {
    // go through all plaintexts and simulate the ones that must be simulated.
    // note how the interface is as such so that the result does not reveal which is the real proof.
    var self = this;

    var proofs = list_of_plaintexts.map(function (plaintext, p_num) {
      if (p_num === real_index) {
        // no real proof yet
        return {};
      } else {
        // simulate!
        return self.simulateProof(plaintext);
      }
    });
    // do the real proof
    var real_proof = this.generateProof(
      list_of_plaintexts[real_index],
      randomness,
      function (commitment) {
        // now we generate the challenge for the real proof by first determining
        // the challenge for the whole disjunctive proof.

        // set up the partial real proof so we're ready to get the hash;
        proofs[real_index] = { commitment: commitment };

        // get the commitments in a list and generate the whole disjunctive challenge
        var commitments = _(proofs).map(function (proof) {
          return proof.commitment;
        });

        var disjunctive_challenge = challenge_generator(commitments);

        // now we must subtract all of the other challenges from this challenge.
        var real_challenge = disjunctive_challenge;;
        _(proofs).each(function (proof, proof_num) {
          if (Number(proof_num) !== Number(real_index))
            real_challenge = real_challenge.add(proof.challenge.negate());
        });

        // make sure we mod q, the exponent modulus
        return real_challenge.mod(self.pk.q);
      }
    );

    // set the real proof
    proofs[real_index] = real_proof;
    return new ElGamal.DisjunctiveProof(proofs);
  }

  verifyDisjunctiveProof(list_of_plaintexts, disj_proof, challenge_generator) {
    var proofs = disj_proof.proofs;

    // for loop because we want to bail out of the inner loop
    // if we fail one of the verifications.
    for (var i = 0; i < list_of_plaintexts.length; i++) {
      if (!this.verifyProof(list_of_plaintexts[i], proofs[i])) return false;
    }

    // check the overall challenge

    // first the one expected from the proofs
    var commitments = _(proofs).map(function (proof) {
      return proof.commitment;
    });
    var expected_challenge = challenge_generator(commitments);

    // then the one that is the sum of the previous one.
    var sum = new BigInt("0", 10);
    var self = this;
    _(proofs).each(function (proof) {
      sum = sum.add(proof.challenge).mod(self.pk.q);
    });

    return expected_challenge.equals(sum);
  }

  equals(other) {
    return this.alpha.equals(other.alpha) && this.beta.equals(other.beta);
  }
}

Ciphertext.fromJSONObject = function (d, pk) {
  return new Ciphertext(
    BigInt.fromJSONObject(d.alpha),
    BigInt.fromJSONObject(d.beta),
    pk
  );
};

ElGamal.Ciphertext = Ciphertext;

class Plaintext {
  constructor(m, pk, encode_m) {
    if (m == null) {
      alert("oy null m");
      return;
    }

    this.pk = pk;

    if (encode_m) {
      // need to encode the message given that p = 2q+1
      var y = m.add(BigInt.ONE);
      var test = y.modPow(pk.q, pk.p);
      if (test.equals(BigInt.ONE)) {
        this.m = y;
      } else {
        this.m = y.negate().mod(pk.p);
      }
    } else {
      this.m = m;
    }
  }

  getPlaintext() {
    var y;

    // if m < q
    if (this.m.compareTo(this.pk.q) < 0) {
      y = this.m;
    } else {
      y = this.m.negate().mod(this.pk.p);
    }

    return y.subtract(BigInt.ONE);
  }

  getM() {
    return this.m;
  }
}
ElGamal.Plaintext = Plaintext;

// we need the public key to figure out how to encode m

//
// Proof abstraction
//

class Proof {
  constructor(A, B, challenge, response) {
    this.commitment = {};
    this.commitment.A = A;
    this.commitment.B = B;
    this.challenge = challenge;
    this.response = response;
  }

  toJSONObject() {
    return {
      challenge: this.challenge.toJSONObject(),
      commitment: {
        A: this.commitment.A.toJSONObject(),
        B: this.commitment.B.toJSONObject(),
      },
      response: this.response.toJSONObject(),
    };
  }

  // verify a DH tuple proof
  verify(little_g, little_h, big_g, big_h, p, q, challenge_generator) {
    // check that little_g^response = A * big_g^challenge
    var first_check = little_g
      .modPow(this.response, p)
      .equals(
        big_g.modPow(this.challenge, p).multiply(this.commitment.A).mod(p)
      );

    // check that little_h^response = B * big_h^challenge
    var second_check = little_h
      .modPow(this.response, p)
      .equals(
        big_h.modPow(this.challenge, p).multiply(this.commitment.B).mod(p)
      );

    var third_check = true;

    if (challenge_generator) {
      third_check = this.challenge.equals(challenge_generator(this.commitment));
    }

    return first_check && second_check && third_check;
  }
}

Proof.fromJSONObject = function (d) {
  return new Proof(
    BigInt.fromJSONObject(d.commitment.A),
    BigInt.fromJSONObject(d.commitment.B),
    BigInt.fromJSONObject(d.challenge),
    BigInt.fromJSONObject(d.response)
  );
};
ElGamal.Proof = Proof;

// a generic way to prove that four values are a DH tuple.
// a DH tuple is g,h,G,H where G = g^x and H=h^x
// challenge generator takes a commitment, whose subvalues are A and B
// all modulo p, with group order q, which we provide just in case.
// as it turns out, G and H are not necessary to generate this proof, given that they're implied by x.
Proof.generate = function (little_g, little_h, x, p, q, challenge_generator) {
  // generate random w
  var w = Random.getRandomInteger(q);

  // create a proof instance
  var proof = new ElGamal.Proof();

  // compute A=little_g^w, B=little_h^w
  proof.commitment.A = little_g.modPow(w, p);
  proof.commitment.B = little_h.modPow(w, p);

  // Get the challenge from the callback that generates it
  proof.challenge = challenge_generator(proof.commitment);

  // Compute response = w + x * challenge
  proof.response = w.add(x.multiply(proof.challenge)).mod(q);

  return proof;
};

// simulate a a DH-tuple proof, with a potentially assigned challenge (but can be null)
Proof.simulate = function (little_g, little_h, big_g, big_h, p, q, challenge) {
  // generate a random challenge if not provided
  if (challenge == null) {
    challenge = Random.getRandomInteger(q);
  }

  // random response, does not even need to depend on the challenge
  var response = Random.getRandomInteger(q);

  // now we compute A and B
  // A = little_g ^ w, and at verification time, g^response = G^challenge * A, so A = (G^challenge)^-1 * g^response
  var A = big_g
    .modPow(challenge, p)
    .modInverse(p)
    .multiply(little_g.modPow(response, p))
    .mod(p);

  // B = little_h ^ w, and at verification time, h^response = H^challenge * B, so B = (H^challenge)^-1 * h^response
  var B = big_h
    .modPow(challenge, p)
    .modInverse(p)
    .multiply(little_h.modPow(response, p))
    .mod(p);

  return new Proof(A, B, challenge, response);
};

class DisjunctiveProof {
  constructor(list_of_proofs) {
    this.proofs = list_of_proofs;
  }
  toJSONObject() {
    return _(this.proofs).map(function (proof) {
      return proof.toJSONObject();
    });
  }
}

DisjunctiveProof.fromJSONObject = function (d) {
  if (d == null) return null;

  return new DisjunctiveProof(
    _(d).map(function (p) {
      return Proof.fromJSONObject(p);
    })
  );
};
ElGamal.DisjunctiveProof = DisjunctiveProof;

ElGamal.encrypt = function (pk, plaintext, r) {
  if (plaintext.getM().compareTo(BigInt.ZERO) === 0)
    throw new Error("Can't encrypt 0 with El Gamal");

  if (!r) r = Random.getRandomInteger(pk.q);
  var alpha = pk.g.modPow(r, pk.p);
  var beta = pk.y.modPow(r, pk.p).multiply(plaintext.m).mod(pk.p);

  return new Ciphertext(alpha, beta, pk);
};

ElGamal.encryptMixnet = function (pk, m, r) {
  let BigIntM = new BigInt(String(m));
  var y = BigIntM.add(BigInt.ONE);
  var test = y.modPow(pk.q, pk.p);
  if (test.equals(BigInt.ONE)) {
    BigIntM = y;
  } else {
    BigIntM = y.negate().mod(pk.p);
  }

  if (BigIntM.compareTo(BigInt.ZERO) === 0)
    throw new Error("Can't encrypt 0 with El Gamal");

  if (!r) r = Random.getRandomInteger(pk.q);
  var alpha = pk.g.modPow(r, pk.p);
  var beta = pk.y.modPow(r, pk.p).multiply(BigIntM).mod(pk.p);

  return new Ciphertext(alpha, beta, pk);
};

//
// DLog Proof
//

class DLogProof {
  constructor(commitment, challenge, response) {
    this.commitment = commitment;
    this.challenge = challenge;
    this.response = response;
  }

  toJSONObject() {
    return {
      challenge: this.challenge.toJSONObject(),
      commitment: this.commitment.toJSONObject(),
      response: this.response.toJSONObject(),
    };
  }
}

DLogProof.fromJSONObject = function (d) {
  return new DLogProof(
    BigInt.fromJSONObject(d.commitment || d.s),
    BigInt.fromJSONObject(d.challenge),
    BigInt.fromJSONObject(d.response)
  );
};

ElGamal.DLogProof = DLogProof;

// a challenge generator based on a list of commitments of
// proofs of knowledge of plaintext. Just appends A and B with commas.
ElGamal.disjunctive_challenge_generator = function (commitments) {
  var strings_to_hash = [];

  // go through all proofs and append the commitments
  _(commitments).each(function (commitment) {
    // toJSONObject instead of toString because of IE weirdness.
    strings_to_hash[strings_to_hash.length] = commitment.A.toJSONObject();
    strings_to_hash[strings_to_hash.length] = commitment.B.toJSONObject();
  });

  // console.log(strings_to_hash);
  // STRINGS = strings_to_hash;
  return new BigInt(hex_sha1(strings_to_hash.join(",")), 16);
};

// a challenge generator for Fiat-Shamir
ElGamal.fiatshamir_challenge_generator = function (commitment) {
  return ElGamal.disjunctive_challenge_generator([commitment]);
};

ElGamal.fiatshamir_dlog_challenge_generator = function (commitment) {
  return new BigInt(hex_sha1(commitment.toJSONObject()), 16);
};
