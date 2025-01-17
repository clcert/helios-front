import ResumeTable from "./ResumeTable";
import WeightsTable from "./WeightsTable";

function StyledTitle({ title }) {
  return (
    <div>
      <h1 className="title is-size-4 pt-4">
        {title}
      </h1>
    </div>
  )
}

function InfoElection(props) {
  /**
   * Component containing the election information
   */

  if (props.totalVoters !== 0) {
    return (
      <section className="section voters-section is-flex is-flex-direction-column is-align-items-center">
        {props.load ? (
          <>
            {" "}
            {props.weightsEnd && props.weightsInit ? (
              <>
                <>
                  <StyledTitle title="Datos Generales"/>
                  <ResumeTable />
                </>
                {props.maxWeight && props.maxWeight !== 1 && (
                  <>
                    <StyledTitle title="Número de votantes por ponderación"/>
                    <WeightsTable
                      weightsInit={props.weightsInit}
                      weightsEnd={props.weightsEnd}
                      weightsElection={props.weightsElection}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="box" id="not-results-box">
                <p className="is-size-3 has-text-weight-bold">
                  Elección aun no finaliza.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="spinner-animation"></div>
        )}
      </section>
    );
  } else {
    return (
      <section className="section voters-section is-flex is-flex-direction-column is-align-items-center">
        <div>
          <h1 className="title is-size-4">
            Aun no existen votantes para esta elección
          </h1>
        </div>
      </section>
    );
  }
}

export default InfoElection;
