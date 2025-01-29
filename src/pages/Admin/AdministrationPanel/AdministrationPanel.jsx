import { useCallback, useEffect, useRef, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../utils/utils";
import { getElection, getStats } from "../../../services/election";
import { getTotalTrustees } from "../../../services/trustee";
import { setElection, setTotalTrustees, setTotalVoters } from "../../../store/slices/electionSlice";
import { electionStatus } from "../../../constants";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import NavbarAdmin from "../../../component/ShortNavBar/NavbarAdmin";
import SubNavbar from "../component/SubNavbar";
import ExtendElection from "./component/ExtendElection";
import ModalFreeze from "./component/ModalFreeze";
import ModalCloseElection from "./component/ModalCloseElection";
import ModalTally from "./component/ModalTally";
import ModalCombineTally from "./component/ModalCombineTally";
import CardInfo from "./component/CardInfo";
import CardSettings from "./component/CardSettings";
import CardSteps from "./component/CardSteps";
import UploadModal from "../VotersList/components/UploadModal";
import ModalDeleteElection from "./component/ModalDeleteElection";
import ModalResultsRelease from "./component/ModalReleaseResults";
import ModalGenerationKey from "./component/ModalGenerationKey";
import ModalOpeningReady from "./component/ModalOpeningReady";
import ModalBackToSetting from "./component/ModalBackToSetting";
import { getTotalVoters } from "../../../services/voters";

export const StateContext = createContext();

function AdministrationPanel() {
  const dispatch = useDispatch();
  const election = useSelector((state) => state.election.actualElection);
  const totalVoters = useSelector((state) => state.election.totalVoters);
  const totalTrustees = useSelector((state) => state.election.totalTrustees);
  const { shortName } = useParams();

  const [modals, setModals] = useState({
    extendElectionModal: false,
    freezeModal: false,
    closeModal: false,
    tallyModal: false,
    combineTallyModal: false,
    deleteElectionModal: false,
    generationReadyModal: false,
    openingReadyModal: false,
    backToSettingModal: false,
    releaseElectionModal: false,
    uploadModal: false,
  });

  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [load, setLoad] = useState(false);
  const [loadCard, setLoadCard] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  const interTallyRef = useRef(null);

  const updateInfo = useCallback(async () => {
    try {
      setLoadCard(true);
      const [statsRes, votersRes, trusteesRes] = await Promise.all([
        getStats(shortName),
        getTotalVoters(shortName),
        getTotalTrustees(shortName),
      ]);

      setTotalVotes(statsRes.jsonResponse.num_casted_votes);
      dispatch(setTotalVoters(votersRes.jsonResponse.total_voters));
      dispatch(setTotalTrustees(trusteesRes.jsonResponse.total_trustees));
      setLoadCard(false);
    } catch (error) {
      console.error("Failed to update info:", error);
    }
  }, [shortName, dispatch]);

  const updateElection = useCallback(async () => {
    const election = await getElection(shortName);
    const { resp, jsonResponse } = election;
    if (resp.status === 200) {
      dispatch(setElection(jsonResponse));
    } else if (resp.status === 401) {
      logout();
    }
  }, [shortName, dispatch]);

  const tallyHandler = useCallback(() => {
    const interval = setInterval(async () => {
      await updateElection();
    }, 10000);
    interTallyRef.current = interval;
  }, [updateElection]);

  useEffect(() => {
    updateElection();
    setLoad(true);
    updateInfo();
    return () => {
      clearInterval(interTallyRef.current);
    };
  }, [updateElection, updateInfo]);

  useEffect(() => {
    if (interTallyRef.current === null && election.status === electionStatus.computingTally) {
      tallyHandler();
    } else {
      clearInterval(interTallyRef.current);
    }
  }, [election.status, tallyHandler]);

  const renderModals = () => (
    <>
      <ExtendElection show={modals.extendElectionModal} onHide={() => setModals((prev) => ({ ...prev, extendElectionModal: false }))} />
      <ModalFreeze
        show={modals.freezeModal}
        onHide={() => setModals((prev) => ({ ...prev, freezeModal: false }))}
        freezeChange={() => dispatch(setElection({ ...election, status: electionStatus.started }))}
        feedback={(message, type) => setFeedback({ message, type })}
        shortName={shortName}
      />
      <ModalCloseElection
        show={modals.closeModal}
        onHide={() => setModals((prev) => ({ ...prev, closeModal: false }))}
        endChange={() => dispatch(setElection({ ...election, status: electionStatus.ended }))}
        feedback={(message, type) => setFeedback({ message, type })}
        shortName={shortName}
      />
      <ModalTally
        show={modals.tallyModal}
        onHide={() => setModals((prev) => ({ ...prev, tallyModal: false }))}
        tallyChange={() => dispatch(setElection({ ...election, status: electionStatus.computingTally }))}
        feedback={(message, type) => setFeedback({ message, type })}
        shortName={shortName}
      />
      <ModalCombineTally
        show={modals.combineTallyModal}
        onHide={() => setModals((prev) => ({ ...prev, combineTallyModal: false }))}
        combineChange={() => dispatch(setElection({ ...election, status: electionStatus.decryptionsCombined }))}
        feedback={(message, type) => setFeedback({ message, type })}
        shortName={shortName}
      />
      <UploadModal show={modals.uploadModal} onHide={() => setModals((prev) => ({ ...prev, uploadModal: false }))} shortName={shortName} />
      <ModalDeleteElection show={modals.deleteElectionModal} onHide={() => setModals((prev) => ({ ...prev, deleteElectionModal: false }))} shortName={shortName} />
      <ModalGenerationKey
        show={modals.generationReadyModal}
        generationChange={() => dispatch(setElection({ ...election, status: electionStatus.readyForKeyGeneration }))}
        onHide={() => setModals((prev) => ({ ...prev, generationReadyModal: false }))}
        shortName={shortName}
      />
      <ModalOpeningReady
        show={modals.openingReadyModal}
        openingChange={() => dispatch(setElection({ ...election, status: electionStatus.readyForOpening }))}
        onHide={() => setModals((prev) => ({ ...prev, openingReadyModal: false }))}
        shortName={shortName}
      />
      <ModalBackToSetting
        show={modals.backToSettingModal}
        onHide={() => setModals((prev) => ({ ...prev, backToSettingModal: false }))}
        shortName={shortName}
        backChange={() => dispatch(setElection({ ...election, status: electionStatus.settingUp }))}
      />
      <ModalResultsRelease
        show={modals.releaseElectionModal}
        onHide={() => setModals((prev) => ({ ...prev, releaseElectionModal: false }))}
        feedback={(message, type) => setFeedback({ message, type })}
        shortName={shortName}
      />
    </>
  );

  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <NavbarAdmin />
          <TitlePsifos namePage="Panel de Administración" nameElection={election.name} />
        </div>
      </section>

      <SubNavbar active={1} />

      <section className="section voters-section is-flex is-flex-direction-column is-align-items-center" id="accordion-section">
        {load && Object.keys(election).length !== 0 ? (
          <div className="container is-max-desktop">
            {feedback.message && (
              <div id="feedback-message" className={`notification is-primary ${feedback.type}`}>
                <button className="delete" onClick={() => setFeedback({ message: "", type: "" })}></button>
                {feedback.message}
              </div>
            )}
            <div className="has-text-centered title is-size-4-mobile">{election.name}</div>
            <hr />
            <div className="columns">
              <div className="column">
                <CardSettings election={election} setDeleteElectionModal={() => setModals((prev) => ({ ...prev, deleteElectionModal: true }))} />
                <CardSteps
                  election={election}
                  electionStep={election.status}
                  freezeModal={() => setModals((prev) => ({ ...prev, freezeModal: true }))}
                  generationReadyModal={() => setModals((prev) => ({ ...prev, generationReadyModal: true }))}
                  openingReadyModal={() => setModals((prev) => ({ ...prev, openingReadyModal: true }))}
                  backToSettingModal={() => setModals((prev) => ({ ...prev, backToSettingModal: true }))}
                  closeModal={() => setModals((prev) => ({ ...prev, closeModal: true }))}
                  tallyModal={() => setModals((prev) => ({ ...prev, tallyModal: true }))}
                  combineTallyModal={() => setModals((prev) => ({ ...prev, combineTallyModal: true }))}
                  releaseModal={() => setModals((prev) => ({ ...prev, releaseElectionModal: true }))}
                  uploadModalonClick={(value) => setModals((prev) => ({ ...prev, uploadModal: value }))}
                />
              </div>
              <div className="column">
                <CardInfo
                  election={election}
                  totalTrustees={totalTrustees}
                  electionStep={election.status}
                  updateInfo={updateInfo}
                  totalVoters={totalVoters}
                  totalVotes={totalVotes}
                  isLoading={loadCard}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="spinner-animation"></div>
        )}
      </section>
      <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
      {renderModals()}
    </div>
  );
}

export default AdministrationPanel;
