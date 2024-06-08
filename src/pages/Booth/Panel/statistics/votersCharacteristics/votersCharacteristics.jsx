import { isSettingUpElection, isOpenLoginElection } from "../../../../../utils"
import ShowStatistics from "../components/showStatistics"
import VotersCharacteristicsStats from "./votersCharacteristicsStats"

export default function RollCharacteristics({ election }) {
  return(
    <ShowStatistics
        notAvailableMessage="La elección aun no comienza"
        showNotAvailableMessage={
            election && isSettingUpElection(election.election_status)
        }
        isLoadData={Boolean(election)}
        statisticsComponent={<VotersCharacteristicsStats
            election={election}
        />}
    />
  )
}