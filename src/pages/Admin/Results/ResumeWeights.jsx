import CardTitle from "./components/CardTitle";
import WeightsTable from "../ElectionResume/components/WeightsTable";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVotersInit, getVotesEnd, getVotesInit } from "../../../services/election";

/**
 * Renders a table with the weights of the voters in an election.
 * @param {Object} props - The component props.
 * @param {string} [props.group=undefined] - The voter group to filter the weights by.
 * @param {boolean} [props.grouped=false] - Whether the weights are already grouped by voter group.
 * @returns {JSX.Element} - The component's markup.
 */
export default function ResumeWeights({ group = undefined, grouped = false }) {
  /** The initial weights of the voters. */
  const [weightsVotersInit, setWeightsVotersInit] = useState({});
  const [groupWeightsVotersInit, setGroupWeightsVotersInit] = useState({});

  const [weightsVotesInit, setWeightsVotesInit] = useState({});
  const [groupWeightsVotesInit, setGroupWeightsVotesInit] = useState({});

  const [weightsVotesEnd, setWeightsVotesEnd] = useState({});
  const [groupWeightsVotesEnd, setGroupWeightsVotesEnd] = useState({});

  /** The short name of the election, obtained from the URL parameters. */
  const { shortName } = useParams();

  const initComponent = useCallback(async () => {
    try {
      const votersInitResponse = await getVotersInit(shortName);
      setWeightsVotersInit(votersInitResponse.jsonResponse.voters_by_weight_init);
      setGroupWeightsVotersInit(votersInitResponse.jsonResponse.voters_by_weight_init_grouped);

      const votesInitResponse = await getVotesInit(shortName);
      setWeightsVotesInit(votesInitResponse.jsonResponse.votes_by_weight);
      setGroupWeightsVotesInit(votesInitResponse.jsonResponse.votes_by_weight_grouped);

      const votesEndResponse = await getVotesEnd(shortName);
      setWeightsVotesEnd(votesEndResponse.jsonResponse.votes_by_weight_end);
      setGroupWeightsVotesEnd(votesEndResponse.jsonResponse.votes_by_weight_end_grouped);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, [shortName]);

  /**
   * Fetches the election's resume data from the server and sets the component's state with it.
   */
  useEffect(() => {
    initComponent();
  }, [initComponent]);

  /**
   * Searches for a group in the given JSON objects and sets the corresponding weights.
   * @param {Object} votersInit - The JSON object containing the initial weights grouped by voter group.
   * @param {Object} votesInit - The JSON object containing the final weights grouped by voter group.
   * @param {Object} votesEnd - The JSON object containing the election weights grouped by voter group.
   */
  const searchGroup = useCallback(
    (votersInit, votesInit, votesEnd) => {
      console.log(votersInit)
      console.log(votesInit)
      console.log(votesEnd)
      const auxGroup = group === "Sin grupo" ? "" : group;
      const groupVotersInit = votersInit.find(
        (element) => element.group === auxGroup
      );
      if (!groupVotersInit) return;
      // setGroupWeightsVotersInit(groupVotersInit.weights);
      setWeightsVotersInit(groupVotersInit.weights);
      const groupVotesInit = votesInit.find(
        (element) => element.group === auxGroup
      );
      // setGroupWeightsVotesInit(groupVotesInit ? groupVotesInit.weights : {});
      setWeightsVotesInit(groupVotesInit ? groupVotesInit.weights : {});
      const groupVotesEnd = votesEnd.find(
        (element) => element.group === auxGroup
      );
      // setGroupWeightsVotesEnd(groupVotesEnd ? groupVotesEnd.weights : {});
      setWeightsVotesEnd(groupVotesEnd ? groupVotesEnd.weights : {});
    },
    [group]
  );

  const searchGroupState = useCallback(() => {
    if (
      group !== undefined &&
      Object.keys(groupWeightsVotersInit).length > 0 &&
      Object.keys(groupWeightsVotesInit).length > 0 &&
      Object.keys(groupWeightsVotesEnd).length > 0
    )
      searchGroup(groupWeightsVotersInit, groupWeightsVotesInit, groupWeightsVotesEnd);
    else {
    }
  }, [group, groupWeightsVotersInit, groupWeightsVotesInit, groupWeightsVotesEnd, searchGroup]);

  useEffect(() => {
    searchGroupState();
  }, [searchGroupState]);

  return (
    <>
      {(
          <>
            <CardTitle
              title={
                "Número de votantes por ponderación " +
                (grouped ? ` - ${group}` : "")
              }
            />
              <WeightsTable
                weightsInit={weightsVotersInit}
                weightsEnd={weightsVotesInit}
                weightsElection={weightsVotesEnd}
              />
        </>
        )}
    </>
  );
}
