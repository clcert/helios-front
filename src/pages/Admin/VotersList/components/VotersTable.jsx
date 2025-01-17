import { useState, useEffect, useCallback } from "react";
import { Button } from "react-bulma-components";
import { getStats } from "../../../../services/election"
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { getVotesInfo } from "../../../../services/info";

function VotersTable({
  election = {},
  setVoterSelect,
  setDeleteVoterModal,
  setEditVoterModal,
  editVoterModal
}) {
  const [voters, setVoters] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [previousDisabled, setPreviousDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [actualPage, setPage] = useState(0);
  const [voterToSearch, setVoterToSearch] = useState("");
  const [voterByHash, setVoterByHash] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const maxForPage = 50;

  /**
   * Get Voters
   * @param {number} page - page number
   * @param {object} param1 - object with voterName and voteHash
   * @param {string} param1.voterName - voter name
   * @param {string} param1.voteHash - vote hash

   */
  const getVoters = useCallback(
    async (page, { voterName = "", voteHash = "" } = {}) => {
      getVotesInfo(election.short_name, page, maxForPage, {
        voterName: voterName,
        voteHash: voteHash,
      }).then((data) => {
        setVoters(data.voters);
        setNextDisabled(!data.more_votes);
      });
    },
    [election]
  );

  const initComponent = useCallback(() => {
    if(editVoterModal) return;
    
    setIsLoading(true);
    getVoters(0);
    getStats(election.short_name).then((data) => {
      const { jsonResponse } = data;
      setTotalVoters(jsonResponse.total_voters);
      setTotalVotes(jsonResponse.num_casted_votes);
      setIsLoading(false);
    });
  }, [election, getVoters, editVoterModal]);

  useEffect(() => {
    initComponent();
  }, [initComponent]);

  function buttonAction(value) {
    /**
     * set button disabled or enabled
     * @param {string} value
     */
    const newPage = actualPage + value;
    setPage(newPage);
    setPreviousDisabled(newPage === 0);

    if (newPage >= 0) {
      getVoters(newPage);
    }
  }

  /**
   * Search for a voter by name
   * @param {event} event
   */
  function searchVoterByName() {
    getVoters(0, { voterName: voterToSearch });
  }
  /**
   * Search for a voter by hash
   */
  function searchVoterByHash() {
    getVotesInfo(election.short_name, 0, maxForPage, {
      voteHash: voterByHash.trim(),
    }).then((data) => {
      if (voterByHash !== "") searchByHash(data.voters);
      else setVoters(data.voters);
      setNextDisabled(!data.more_votes);
    });
  }
  /**
   * Search voter in the list by hash and set the list of voters
   */
  const searchByHash = useCallback(
    (voters) => {
      const auxVoters = voters.filter((voter) => {
        if (!voter.cast_vote) return false;
        return voter.cast_vote.encrypted_ballot_hash === voterByHash.trim();
      });
      setVoters(auxVoters);
    },
    [voterByHash]
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center pt-4">
        <div className="spinner-animation"></div>
      </div>
    );
  }

  if (totalVoters > 0) {
    return (
      <>
        <div
          className="search-box search_box p-2"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              searchVoterByName();
            }
          }}
        >
          <input
            type="text"
            id="ballot_searched"
            name="q"
            className="input_search"
            placeholder="Buscar votante por nombre o username..."
            value={voterToSearch}
            onChange={(e) => {
              setVoterToSearch(e.target.value);
            }}
          />
          <div className="search-button" onClick={searchVoterByName}>
            <i className="fas fa-lg fa-search"></i>
          </div>
        </div>
        <div
          className="search-box search_box p-2"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              searchVoterByHash();
            }
          }}
        >
          <input
            type="text"
            id="ballot_searched"
            name="q"
            className="input_search"
            placeholder="Buscar votante por código de papeleta..."
            value={voterByHash}
            onChange={(e) => {
              setVoterByHash(e.target.value);
            }}
          />
          <div className="search-button" onClick={searchVoterByHash}>
            <i className="fas fa-lg fa-search"></i>
          </div>
        </div>
        <p id="search-message"></p>
        <p className="search-box">
          {election.num_cast_votes ? (
            <>
              <span className="has-text-weight-bold">
                Total de votantes: {totalVoters}
              </span>
              <span> &nbsp; </span>
              <span className="has-text-weight-bold">
                &nbsp;Votos emitidos: {totalVotes}
              </span>
            </>
          ) : (
            <>
              <span className="has-text-weight-bold">
                Total de votantes: {totalVoters}
              </span>
              <span> &nbsp;/ </span>
              <span className="has-text-weight-bold">
                &nbsp;Votos emitidos: {totalVotes}
              </span>
            </>
          )}
        </p>
        <div className="row mt-4">
          <div className="col-6">
            <Button
              className="btn-fixed button-custom"
              disabled={previousDisabled}
              onClick={() => {
                if (!previousDisabled) {
                  buttonAction(-1);
                }
              }}
            >
              Previo
            </Button>
          </div>
          <div className="col-6 d-inline-flex justify-content-end">
            <Button
              className="btn-fixed button-custom"
              disabled={nextDisabled}
              onClick={() => {
                if (!nextDisabled) {
                  buttonAction(1);
                }
              }}
            >
              Siguiente
            </Button>
          </div>
        </div>

        <div>
          <Table className="pretty table is-bordered is-hoverable voters-table">
            <Thead>
              <Tr>
                <Th className="has-text-centered">Login</Th>
                <Th className="has-text-centered">Votante</Th>
                <Th className="has-text-centered">Código de papeleta</Th>
                <Th className="has-text-centered">Ponderador</Th>
                {election.grouped_voters && (
                  <Th className="has-text-centered">Grupo</Th>
                )}
                <Th className="has-text-centered">Acciones</Th>
              </Tr>
            </Thead>
            {voters.map((voter, index) => {
              const voterHash = voter.cast_vote
                ? voter.cast_vote.encrypted_ballot_hash
                : "-";
              return (
                <Tbody key={index}>
                  <Tr>
                    <Td className="align-middle has-text-centered">
                      {voter.username}
                    </Td>

                    <Td className="align-middle has-text-centered">
                      {voter.name}
                    </Td>
                    <Td className="align-middle has-text-centered">
                      <span className="urna-voter-hash">{voterHash}</span>
                    </Td>
                    <Td className="align-middle has-text-centered">
                      {election.normalized ? (
                        <span>
                          {parseFloat(
                            (voter.weight_init / election.max_weight).toFixed(
                              3
                            )
                          )}
                        </span>
                      ) : (
                        <span>{voter.weight_init} </span>
                      )}
                    </Td>
                    {election.grouped_voters && (
                      <Td className="align-middle has-text-centered">
                        {voter.group ? voter.group : "-"}
                      </Td>
                    )}
                    <Td
                      style={{ whiteSpace: "nowrap" }}
                      className="has-text-centered"
                    >
                      <div className="buttons-action-voter">
                        <div
                          onClick={() => {
                            setVoterSelect((prevState) => ({
                              ...prevState,
                              name: voter.name,
                              username: voter.username,
                              weight_init: voter.weight_init,
                            }));
                            setEditVoterModal(true);
                          }}
                          className="button-edit-voter ml-2 mr-2"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        {!voter.cast_vote && (
                          <div
                            onClick={() => {
                              setVoterSelect((prevState) => ({
                                ...prevState,
                                name: voter.name,
                                username: voter.username,
                              }));
                              setDeleteVoterModal(true);
                            }}
                            className="button-delete-voter ml-2 mr-2"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                </Tbody>
              );
            })}
          </Table>{" "}
        </div>
      </>
    );
  } else {
    return (
      <div className="box mt-4" id="not-results-box">
        <p className="is-size-3 has-text-weight-bold">Aun no hay votantes.</p>
      </div>
    );
  }
}

export default VotersTable;
