import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendInfoIp } from "../../../server";
import encryptingGIF from "../../../static/img/encrypting.gif";

function VerifyVoteModal(props) {
  const { shortName } = useParams();

  const getVote = useCallback(async () => {
    const voteHashEncode = encodeURIComponent(props.voteHash);
    const url =
      backendInfoIp + "/election/" + shortName + "/cast-vote/" + voteHashEncode;
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const jsonResponse = await resp.json();
    if (jsonResponse.cast_at !== null && resp.status === 200) {
      props.setVoteVerificates(true);
      props.afterVerify();

    } else if (jsonResponse.invalidated_at !== null || jsonResponse.verified === false) {
      props.setVoteVerificates(false);
      props.afterVerify();
    }
  }, [props, shortName]);

  useEffect(() => {
    if (props.show && props.voteHash) {
      let intervalTotal = setInterval(() => {
        props.afterVerify();
      }, 15000);

      let interval = setInterval(getVote, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(intervalTotal);
      };
    }
  }, [props.show, props.voteHash, getVote, props]);

  return (
    <div className={"modal " + (props.show ? "is-active" : "")} id="help-modal">
      <div className="modal-background"></div>
      <div className="modal-card has-text-centered">
        <section className="modal-card-body single-card">
          <p className="has-text-weight-bold is-size-5">
            VALIDANDO TU VOTO <br />
            POR FAVOR ESPERA UN MOMENTO
          </p>
          <img className="mt-2" src={encryptingGIF} alt="" />
          <p className="subtitle mt-4">
            Se está verificando que el voto se realizó correctamente.<br/>
            No cierre esta ventana.
          </p>
        </section>
      </div>
    </div>
  );
}

export default VerifyVoteModal;
