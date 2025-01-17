import { Link } from "react-router-dom";
import { electionLoginType, electionStatus, trusteeStep } from "../../../../constants";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { checkStatus, electionHasQuestions } from "../../../../services/election";

function Status({
  election,
  uploadModalonClick,
  generationReadyModal,
  openingReadyModal,
  backToSettingModal,
  freezeModal,
  closeModal,
  tallyModal,
  releaseModal,
  combineTallyModal,
  totalVoters,
  totalTrustees,
}) {

  const [loading, setLoading] = useState(true);

  const [addQuestions, setAddQuestions] = useState(false);
  const [canCombineDecryptions, setCanCombineDecryptions] = useState(false);
  const [keyGenerationReady, setKeyGenerationReady] = useState(false);
  const [openingReady, setOpeningReady] = useState(false);
  const [addVoters, setAddVoters] = useState(false);
  const [addTrustees, setAddTrustees] = useState(false);

  useEffect(() => {
    setLoading(true);
    checkStatus(election.short_name).then((response) => {
      setAddVoters(response.jsonResponse.add_voters);
      setAddTrustees(response.jsonResponse.add_trustees);
      setAddQuestions(response.jsonResponse.add_questions);
      setKeyGenerationReady(response.jsonResponse.key_generation_ready);
      setOpeningReady(response.jsonResponse.opening_ready);
      setCanCombineDecryptions(response.jsonResponse.can_combine_decryptions);
      setLoading(false);
    });
  }, [election.short_name, election.status]);

  const defaultTotalVoters = useSelector((state) => state.election.totalVoters);
  const defaultTotalTrustees = useSelector((state) => state.election.totalTrustees);

  totalVoters = totalVoters ?? defaultTotalVoters;
  totalTrustees = totalTrustees ?? defaultTotalTrustees;

  const electionStep = election.status;

  const renderLink = (id, onClick, to, text) => (
    <div className="content-card-admin">
      <span onClick={onClick} className="panel-text-sect">
        <Link id={id} className="link-without-line" to={to}>
          {text}
        </Link>
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="content-card-admin center-text">
        <span className="panel-text-sect">
          <i id="step_1" className="fa-solid fa-spinner fa-spin" />
        </span>
      </div>
    );
  }
  return (
    <>
      {addVoters &&
        renderLink(
          "button-add-voters",
          () => uploadModalonClick(true),
          "",
          "Añadir votantes"
        )}

      {addQuestions &&
        renderLink(
          "button-add-questions",
          null,
          `/psifos/admin/${election.short_name}/create-question/`,
          "Añadir preguntas"
        )}

      {addTrustees &&
        renderLink(
          "button-add-trustee",
          null,
          `/psifos/admin/${election.short_name}/trustee`,
          "Añadir custodios"
        )}

      {electionStep === electionStatus.readyForOpening &&
        renderLink("init-election", freezeModal, "", "Iniciar elección")}

      {keyGenerationReady &&
        renderLink(
          "generate-keys",
          generationReadyModal,
          "",
          "Preparar para la generación de claves"
        )}

      {openingReady &&
        renderLink("generate-keys", openingReadyModal, "", "Cerrar generación de claves")}

      {electionStep === electionStatus.started &&
        renderLink("close-election", closeModal, "", "Cerrar elección")}

      {electionStep === electionStatus.ended &&
        renderLink("compute-tally", tallyModal, "", "Computar Tally")}

      {electionStep === electionStatus.readyForKeyGeneration && !openingReady && (
        <div className="content-card-admin">
          <span className="panel-text-sect">
            Esperando generación de claves...{" "}
            <i id="step_1" className="fa-solid fa-spinner fa-spin" />
          </span>
        </div>
      )}

      {electionStep === electionStatus.readyForKeyGeneration && (
        renderLink("back-to-setting-up", backToSettingModal, "", "Volver a la configuración")
      )}

      {electionStep === electionStatus.computingTally && (
        <div className="content-card-admin">
          <span className="panel-text-sect">
            Computando tally ...{" "}
            <i id="step_1" className="fa-solid fa-spinner fa-spin" />
          </span>
        </div>
      )}

      {electionStep === electionStatus.tallyComputed && (
        <div className="content-card-admin">
          <span className="panel-text-sect">
            <Link
              className="link-without-line"
              to={`/psifos/admin/${election.short_name}/trustee`}
            >
              Esperando desencriptaciones parciales
            </Link>
          </span>
        </div>
      )}

      {canCombineDecryptions &&
        renderLink(
          null,
          combineTallyModal,
          "",
          "Combinar desencriptaciones parciales"
        )}

      {electionStep === electionStatus.decryptionsCombined &&
        renderLink(null, releaseModal, "", "Liberar los resultados")}

      {(electionStep === electionStatus.resultsReleased ||
        electionStep === electionStatus.decryptionsCombined) &&
        renderLink(
          null,
          combineTallyModal,
          `/psifos/admin/${election.short_name}/resultado`,
          "Ver resultados"
        )}
    </>
  );
}

export default Status;
