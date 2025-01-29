import { useCallback, useEffect, useState } from "react";
import { requestStats } from "../components/client";
import { isSettingUpElection } from "../../../../../utils";
import ShowStatistics from "../components/showStatistics";
import ParticipationStats from "./participationStats";

export default function Participation({ shortName, election }) {
  const [totalVoters, setTotalVoters] = useState(undefined);
  const [totalVotes, setTotalVotes] = useState(undefined);

  const initComponent = useCallback(() => {
    requestStats(shortName, setTotalVoters, setTotalVotes)
  }, []);

  useEffect(() => {
    initComponent();
  }, [initComponent]);

  const showNotAvailableMessage = election && isSettingUpElection(
    election.status
  )
  const isLoadData = (
    totalVoters !== undefined && totalVotes !== undefined
  )

  return(
    <ShowStatistics
      notAvailableMessage="La elección aun no comienza"
      showNotAvailableMessage={showNotAvailableMessage}
      isLoadData={isLoadData}
      statisticsComponent={<ParticipationStats
        questions={election && election.questions}
        totalVotes={totalVotes}
        totalVoters={totalVoters}
        loginType={election && election.election_login_type}
      />}
    />
  )
}