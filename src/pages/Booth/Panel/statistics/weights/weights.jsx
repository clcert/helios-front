import { isSettingUpElection, isStartedElection } from "../../../../../utils"
import ShowStatistics from "../components/showStatistics"
import WeightsStats from "./weightsStats"

export default function Weights({ election }) {
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
        statisticsComponent={<WeightsStats
            election={election}
        />}
    />
  )
}