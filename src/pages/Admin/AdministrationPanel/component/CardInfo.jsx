import { Link } from "react-router-dom";
import {
  electionLoginType,
  electionStatusTranslate,
} from "../../../../constants";

const DisplayStats = ({ name, value }) => (
  <div className="content-card-admin">
    <span className="panel-text-sect">{name}</span>: {value}
  </div>
);

const DisplayTicket = ({ name, condition }) => (
  <div className="content-card-admin">
    <span className="panel-text-sect">{name}</span>:{" "}
    <i className={`fa-solid ${condition ? "fa-check" : "fa-x"}`} />
  </div>
);

const CardInfo = ({
  election,
  electionStep,
  updateInfo,
  totalVoters,
  totalVotes,
  totalTrustees,
  isLoading,
}) => {
  const stats = [
    { name: "Estado", value: electionStatusTranslate[electionStep] },
    { name: "Tipo de votación", value: election.type === "Election" ? "Elección" : "Consulta" },
    { name: "Cantidad de votantes", value: totalVoters },
    { name: "Votos recibidos", value: totalVotes },
    { name: "Peso máximo de votantes", value: election.max_weight },
    { name: "Numero Custodios", value: totalTrustees },
  ];

  const tickets = [
    { name: "Elección privada", condition: election.voters_login_type === electionLoginType.close_p },
    { name: "Aleatorizar opciones", condition: election.randomize_answer_order },
    { name: "Elección agrupada", condition: election.grouped_voters },
    { name: "Normalización", condition: election.normalized },
  ];

  return (
    <div className="box">
      <div className="is-size-4">
        Información elección
        <span className="ml-3 is-size-6" onClick={updateInfo}>
          <Link className="link-without-line" to="">
            <i className="fa-solid fa-arrows-rotate"></i> Actualizar
          </Link>
        </span>
      </div>

      <hr />
      {!isLoading ? (
        <div className="is-size-5">
          {stats.map((stat, index) => (
            <DisplayStats key={index} name={stat.name} value={stat.value} />
          ))}
          {tickets.map((ticket, index) => (
            <DisplayTicket key={index} name={ticket.name} condition={ticket.condition} />
          ))}
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          <div className="spinner-animation" />
        </div>
      )}
    </div>
  );
};

export default CardInfo;
