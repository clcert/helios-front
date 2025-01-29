import { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTrustees } from "../../../../services/trustee";
import InfoTrustee from "./InfoTrustee";
import { electionStatus } from "../../../../constants";

function TrusteesList({ election, deleteTrustee }) {
  const [trustees, setTrustees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shortName } = useParams();

  const fetchTrustees = useCallback(async () => {
    const response = await getTrustees(shortName);
    setTrustees(response.jsonResponse);
    setIsLoading(false);
  }, [shortName]);

  useEffect(() => {
    fetchTrustees();
  }, [fetchTrustees]);

  useEffect(() => {
    const interval = setInterval(fetchTrustees, 5000);
    return () => clearInterval(interval);
  }, [fetchTrustees]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-animation" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {trustees.length > 0 && (
        <div className="has-text-centered title is-size-4-mobile my-3">
          Lista de custodios
        </div>
      )}
      {trustees.map((trustee, index) => (
        <div className="box border-style-box" key={trustee.name}>
          <div className="level mb-0">
            <span className="has-text-weight-bold is-size-4 level-item">
              Custodio de Clave #{index + 1}
            </span>
            {election.status === "Setting up" && (
              <span className="level-right">
                <i
                  className="close-question fa-solid fa-trash"
                  onClick={() => deleteTrustee(trustee.uuid)}
                />
              </span>
            )}
          </div>

          <p className="mt-0">
            <span className="has-text-weight-bold is-size-4">{trustee.name}</span>
            <br />
            <tt>
              {trustee.username}
              <br />
              {trustee.email}
            </tt>
          </p>

          {trustee.public_key_hash ? (
            <div className="mt-4">
              Código de Clave Pública:{" "}
              <p className="overflow-auto">
                <tt>{trustee.public_key_hash}</tt>
              </p>
            </div>
          ) : (
            <p className="mt-4">Custodio aún no sube su clave pública</p>
          )}

          {[
            electionStatus.tallyComputed,
            electionStatus.decryptionsUploaded,
            electionStatus.decryptionsCombined,
            electionStatus.resultsReleased,
          ].includes(election.status) && <InfoTrustee trustee={trustee} />}
        </div>
      ))}
    </div>
  );
}

export default TrusteesList;
