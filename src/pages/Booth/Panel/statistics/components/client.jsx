import {
    getStats, getElectionPublic, getCountDates,
    getVotersInit,
} from "../../../../../services/election";
import { logout } from "../../../../../utils/utils";

export const requestStats = (
    shortName, setTotalVoters, setTotalVotes,
) => {
    getStats(shortName).then((election) => {
        const { resp, jsonResponse } = election;
        if (resp.status === 200) {
        const { total_voters, num_casted_votes } = jsonResponse;
        setTotalVoters(total_voters);
        setTotalVotes(num_casted_votes);
        }
    }, [])
}

export const requestElectionPublic = (shortName, setElection) => {
    getElectionPublic(shortName).then((election) => {
        const { resp, jsonResponse } = election;
        if (resp.status === 200) {
          setElection(jsonResponse);
        }
    }, [])
}

export const requestElectionResume = (shortName, setWeightsInit, setWeightsElection) => {
    getVotersInit(shortName).then((election) => {
        const { resp, jsonResponse } = election;
        if (resp.status === 200) {
          if(!jsonResponse.weights_init) return;
          const { weights_init, weights_election } = jsonResponse;
          const { voters_by_weight_init } = JSON.parse(weights_init);
          const weights = Object.keys(voters_by_weight_init);
          setWeightsInit(weights.sort());
          const { voters_by_weight } = JSON.parse(weights_election);
          setWeightsElection(voters_by_weight);
        } else if (resp.status === 401) {
          logout();
        }
    }, []);
}

export const requestCountDates = (
    shortName, deltaTime, setVotesForTime,
) => {
    getCountDates(shortName, deltaTime).then((election) => {
        const { resp, jsonResponse } = election;
        if (resp.status === 200) {
            setVotesForTime(jsonResponse);
        }
    }, [])
}
