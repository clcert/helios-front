import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  electionLoginType,
  electionStatusTranslate,
} from "../../../../constants";

const DisplayStats = ({ name, value }) => {
  return (
    <div className="content-card-admin">
      <span className="panel-text-sect">{name}</span>: {value}
    </div>
  );
};

const DisplayTicket = ({ name, condition }) => {
  return (
    <div className="content-card-admin">
      <span className="panel-text-sect">{name}</span>:{" "}
      {condition ? (
        <i className="fa-solid fa-check" />
      ) : (
        <i className="fa-solid fa-x" />
      )}
    </div>
  );
};

function CardInfo({
  election,
  electionStep,
  updateInfo,
  totalVoters,
  totalVotes,
  trustees = [],
}) {
  /** @state {num} number of decryptions */
  const [decryptionNumber, setDecryptionNumber] = useState(0);

  useEffect(() => {
    let number_decryptions = 0;
    trustees.forEach((trustee) => {
      if (trustee.decryptions !== "") {
        number_decryptions++;
      }
    });
    setDecryptionNumber(number_decryptions);
  }, [trustees, electionStep]);

  return (
    <div className="box ">
      <div className="is-size-4">
        Información elección
        <span
          className="ml-3 is-size-6"
          onClick={() => {
            updateInfo();
          }}
        >
          <Link className="link-without-line" to="">
            <i className="fa-solid fa-arrows-rotate"></i> Actualizar
          </Link>
        </span>
      </div>

      <hr />
      <div className="is-size-5">
        <DisplayStats
          name="Estado"
          value={electionStatusTranslate[electionStep]}
        />
        <DisplayStats
          name="Tipo de votación"
          value={
            election.type === "Election" ? "Elección" : "Consulta"
          }
        />
        <DisplayStats name="Cantidad de votantes" value={totalVoters} />
        <DisplayStats name="Votos recibidos" value={totalVotes} />
        <DisplayStats
          name="Peso máximo de votantes"
          value={election.max_weight}
        />
        <DisplayStats name="Numero Custodios" value={election.total_trustees} />
        {electionStep === "Tally computed" ||
          (electionStep === "Decryptions uploaded" && (
            <DisplayStats
              name="Desencriptaciones Parciales"
              value={decryptionNumber / election.total_trustees}
            />
          ))}
        <DisplayTicket
          name="Elección privada"
          condition={election.voters_login_type === electionLoginType.close_p}
        />
        <DisplayTicket
          name="Aleatorizar opciones"
          condition={election.randomize_answer_order}
        />
        <DisplayTicket name="Elección agrupada" condition={election.grouped_voters} />
        <DisplayTicket
          name="Normalización"
          condition={election.normalized}
        />
      </div>
    </div>
  );
}

export default CardInfo;
