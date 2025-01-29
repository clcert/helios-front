import { trusteeStep } from "../../../../constants";

function InfoTrustee({ trustee }) {
  const hasDecryption = trustee.current_step === trusteeStep.decryptions_sent;

  return (
    <div>
      {hasDecryption ? (
        <p
          id="decryption-finish"
          className="has-text-weight-bold is-size-5 status-decryption is-flex is-flex-direction-column"
        >
          DESENCRIPTACIÓN PARCIAL RECIBIDA
        </p>
      ) : (
        <p
          id={
            hasDecryption ? "decryption-finish" : "decryption-wait"
          }
          className="has-text-weight-bold is-size-5 status-decryption is-flex is-flex-direction-column"
        >
          ESPERANDO DESENCRIPTACIÓN PARCIAL
        </p>
      )}
    </div>
  );
}

export default InfoTrustee;
