import _ from "lodash";
import { useState } from "react";
import EncryptedVote from "../../../static/booth/js/jscrypto/encrypted-vote";
import encryptingGIF from "../../../static/img/encrypting.gif";

function ModalPercentage(props) {

  /** @state {boolean}  */
  const [initialize, setInitialize] = useState(false);

  function waitEncryp() {
    let answers_done = _.reject(props.booth.encrypted_answers, _.isNull);
    let percentage_done = Math.round(
      (100 * answers_done.length) / props.booth.encrypted_answers.length
    );

    if (percentage_done < 100) {
      setTimeout(waitEncryp, 100);
    } else {
      props.booth.encrypted_ballot = EncryptedVote.fromEncryptedAnswers(
        props.booth.election,
        props.booth.encrypted_answers
      );

      props.booth._after_ballot_encryption();
      props.afterEncrypt();
      setInitialize(false);
    }
  }
  if (!initialize && props.show) {
    setInitialize(true);
    waitEncryp();
  }
  return (
    <div className={"modal " + (props.show ? "is-active" : "")} id="help-modal">
      <div className="modal-background"></div>
      <div className="modal-card">
        <section className="modal-card-body single-card">
          <p className="has-text-weight-bold is-size-5">
            ENCRIPTANDO TU VOTO <br />
            POR FAVOR ESPERA UN MOMENTO
          </p>
          <img className="mt-2" alt="" src={encryptingGIF} />
          <p className="subtitle mt-4">
            Tu voto se está transformando para mantenerlo en secreto.<br/>
            No cierre esta ventana.
          </p>
          {/* <PercentageBar percentage={percentage} booth={props.booth} /> */}
        </section>
      </div>
    </div>
  );
}

export default ModalPercentage;
