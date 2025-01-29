import { isSettingUpElection, isStartedElection } from "../../../../../utils"
import ShowStatistics from "../components/showStatistics"
import VotersCharacteristicsStats from "./votersCharacteristicsStats"

export default function VotersCharacteristics({ election }) {
  const status = election && election.status
  const settingUp = status && isSettingUpElection(status)
  const started = status && isStartedElection(status)
  return(
    <ShowStatistics
        notAvailableMessage={
          (settingUp && "La elección aun no comienza")
          || (started && "La elección aun no finaliza")
        }
        showNotAvailableMessage={
            election && (settingUp || started)
        }
        isLoadData={Boolean(election)}
        statisticsComponent={<VotersCharacteristicsStats
            election={election}
            loginType={election && election.election_login_type}
        />}
    />
  )
}