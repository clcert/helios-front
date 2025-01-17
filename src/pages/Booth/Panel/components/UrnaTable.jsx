import { useParams, useSearchParams } from "react-router-dom";
import { backendInfoIp } from "../../../../server";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";

function UrnaTable({ election, electionVoters }) {
  const [searchParams] = useSearchParams();

  const hashUrl =
    searchParams.get("hash") !== null ? searchParams.get("hash") : undefined;
  const { shortName } = useParams();

  const openWindowVote = (voteHash) => {
    window.open(
      `${backendInfoIp}/election/${shortName}/cast-vote/${encodeURIComponent(
        voteHash
      )}`,
      "_blank"
    );
  };
  const isShowWeightColumn = election.max_weight > 1;
  return (
    <Table className="pretty table is-bordered is-hoverable voters-table mt-2">
      <Thead>
        <Tr>
          <Th className="has-text-centered">Código de Papeleta</Th>
          {isShowWeightColumn && (
            <Th className="has-text-centered">Ponderador</Th>
          )}
          <Th className="has-text-centered">Voto Encriptado</Th>
        </Tr>
      </Thead>
      {electionVoters.map((voter, index) => {
        const voterHash = voter.cast_vote ? voter.cast_vote.encrypted_ballot_hash : "-";
        return (
          <Tbody key={index}>
            <Tr>
              <Td
                className={
                  "align-middle has-text-centered " +
                  (hashUrl === voterHash ? "hash-selected" : "")
                }
              >
                <span className="urna-voter-hash">{voterHash}</span>
              </Td>
              {isShowWeightColumn && (
                <Td
                  className={
                    "align-middle has-text-centered " +
                    (hashUrl === voterHash ? "hash-selected" : "")
                  }
                >
                  {election.normalized ? (
                    <span>
                      {parseFloat(
                        (voter.weight_init / election.max_weight).toFixed(3)
                      )}
                    </span>
                  ) : (
                    <span>{voter.weight_init} </span>
                  )}
                </Td>
              )}
              <Td
                className={
                  "align-middle has-text-centered " +
                  (hashUrl === voterHash ? "hash-selected" : "")
                }
              >
                {voterHash !== "-" ? (
                  <div
                    onClick={() => {
                      openWindowVote(voter.cast_vote.encrypted_ballot_hash);
                    }}
                    className="button-redirect-vote ml-2 mr-2"
                  >
                    <i className="fa-solid fa-check-to-slot mr-1"></i>
                  </div>
                ) : (
                  "-"
                )}
              </Td>
            </Tr>
          </Tbody>
        );
      })}
    </Table>
  );
}

export default UrnaTable;
