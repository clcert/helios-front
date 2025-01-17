import { BigInt } from "../static/booth/js/jscrypto/bigint";
import { ElGamal } from "../static/booth/js/jscrypto/elgamal";
import { helios_c } from "../static/booth/js/jscrypto/heliosc-trustee";
import Tally from "../static/booth/js/jscrypto/tally";

/**
 * Create a ElGamal secretKey object with sk and params
 *
 * @param {*} sk election secret key
 * @param {*} params election params
 * @param {*} certificates election certificates
 * @param {*} points election points
 * @returns ElGamal Secret Key
 */
function getSecretKey(sk, params, certificates, points) {
  helios_c.trustee = helios_c.trustee_create(params, sk);
  helios_c.params = params;
  helios_c.certificates = certificates;
  helios_c.points = points;
  // TODO: check key
  var helios_c_sk = helios_c.ui_share_get_direct();
  return new ElGamal.SecretKey(helios_c_sk.x, helios_c_sk.public_key);
}

/**
 * Decrypt Tally
 *
 * @param {*} sk election secret key
 * @param {*} tally tally
 * @param {*} electionPk election public key
 * @param {*} params election params
 * @param {*} certificates election certificates
 * @param {*} points election points
 */
function decrypt(sk, tally, electionPk, params, certificates, points) {
  try {
    var secret_key = getSecretKey(sk, params, certificates, points);
  } catch {
    postMessage({
      type: "error",
      message: "Clave incorrecta",
    });
    return
  }

  // ENCRYPTED TALLY :
  let tally_factors_and_proof = tally.doDecrypt(electionPk, secret_key);
  postMessage({
    type: "result",
    tally_factors_and_proof: tally_factors_and_proof,
  });
}

/**
 * Init worker setting data
 */
onmessage = function (event) {
  const params = event.data.params;
  const trustee = event.data.trustee;
  const trustee_crypto = event.data.trustee_crypto;
  const election = event.data.election;
  const secretKey = event.data.secretKey;
  const certificates = event.data.certificates;
  const points = event.data.points;
  const tally = event.data.tally;

  BigInt.setup(function () {
    let PARAMS = ElGamal.Params.fromJSONObject(params);
    PARAMS.trustee_id = trustee_crypto.trustee_election_id;

    let ELECTION_JSON = election;
    let ELECTION_PK = ElGamal.PublicKey.fromJSONObject(
      ELECTION_JSON["public_key"]
    );
    let TALLY = Tally.createAllTally(tally, ELECTION_PK);
    decrypt(secretKey, TALLY, ELECTION_PK, PARAMS, certificates, points);
  });
};
