import { useCallback, useEffect, useRef, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../utils/utils";
import { getElection, getStats } from "../../../services/election";
import { getTotalTrustees, getTrustees } from "../../../services/trustee";
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

/**
 * Main view of the administrator panel where you can modify the parameters of an election
 */

export const StateContext = createContext();
function AdministrationPanel() {
  const dispatch = useDispatch();
  const election = useSelector((state) => state.election.actualElection);
  const totalVoters = useSelector((state) => state.election.totalVoters);
  const { shortName } = useParams();

  const [extendElectionModal, setExtendElectionModal] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [freezeModal, setFreezeModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [tallyModal, setTallyModal] = useState(false);
  const [combineTallyModal, setCombineTallyModal] = useState(false);
  const [deleteElectionModal, setDeleteElectionModal] = useState(false);
  const [generationReadyModal, setGenerationReadyModal] = useState(false);
  const [openingReadyModal, setOpeningReadyModal] = useState(false);
  const [backToSettingModal, setBackToSettingModal] = useState(false);
  const [releaseElectionModal, setReleaseElectionModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [typeFeedback, setTypeFeedback] = useState("");
  const [trustees, setTrustees] = useState([]);
  const [load, setLoad] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  const interTallyRef = useRef(null);

  const updateInfo = useCallback(async () => {
    try {
      const [statsRes, votersRes, trusteesRes] = await Promise.all([
        getStats(shortName),
        getTotalVoters(shortName),
        getTotalTrustees(shortName),
      ]);

      setTotalVotes(statsRes.jsonResponse.num_casted_votes);
      dispatch(setTotalVoters(votersRes.jsonResponse.total_voters));
      dispatch(setTotalTrustees(trusteesRes.jsonResponse.total_trustees));
    } catch (error) {
      console.error("Failed to update info:", error);
    }
  }, [shortName]);

  const updateElection = useCallback(async () => {
    await getElection(shortName).then((election) => {
      const { resp, jsonResponse } = election;
      if (resp.status === 200) {
        dispatch(setElection(jsonResponse));
      } else if (resp.status === 401) {
        logout();
      }
    });
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
    if (
      interTallyRef.current === null &&
      election.status === electionStatus.computingTally
    ) {
      tallyHandler();
    } else {
      clearInterval(interTallyRef.current);
    }
  }, [election.status, tallyHandler]);

  useEffect(() => {
    getTrustees(shortName).then((res) => {
      const { jsonResponse } = res;
      setTrustees(jsonResponse.trustees);
    });
  }, [shortName]);

  const renderModals = () => (
    <>
      <ExtendElection
        show={extendElectionModal}
        onHide={() => setExtendElectionModal(false)}
      />
      <ModalFreeze
        show={freezeModal}
        onHide={() => setFreezeModal(false)}
        freezeChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.started,
            })
          )
        }
        feedback={(message, type) => {
          setFeedbackMessage(message);
          setTypeFeedback(type);
        }}
        shortName={shortName}
      />
      <ModalCloseElection
        show={closeModal}
        onHide={() => setCloseModal(false)}
        endChange={() =>
          dispatch(
            setElection({ ...election, status: electionStatus.ended })
          )
        }
        feedback={(message, type) => {
          setFeedbackMessage(message);
          setTypeFeedback(type);
        }}
        shortName={shortName}
      />
      <ModalTally
        show={tallyModal}
        onHide={() => setTallyModal(false)}
        tallyChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.computingTally,
            })
          )
        }
        feedback={(message, type) => {
          setFeedbackMessage(message);
          setTypeFeedback(type);
        }}
        shortName={shortName}
      />
      <ModalCombineTally
        show={combineTallyModal}
        onHide={() => setCombineTallyModal(false)}
        combineChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.decryptionsCombined,
            })
          )
        }
        feedback={(message, type) => {
          setFeedbackMessage(message);
          setTypeFeedback(type);
        }}
        shortName={shortName}
      />
      <UploadModal
        show={uploadModal}
        onHide={() => setUploadModal(false)}
        shortName={shortName}
      />
      <ModalDeleteElection
        show={deleteElectionModal}
        onHide={() => setDeleteElectionModal(false)}
        shortName={shortName}
      />
      <ModalGenerationKey
        show={generationReadyModal}
        generationChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.readyForKeyGeneration,
            })
          )
        }
        onHide={() => setGenerationReadyModal(false)}
        shortName={shortName}
      />
      <ModalOpeningReady
        show={openingReadyModal}
        openingChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.readyForOpening,
            })
          )
        }
        onHide={() => setOpeningReadyModal(false)}
        shortName={shortName}
      />
      <ModalBackToSetting
        show={backToSettingModal}
        onHide={() => setBackToSettingModal(false)} 
        shortName={shortName}
        backChange={() =>
          dispatch(
            setElection({
              ...election,
              status: electionStatus.settingUp,
            })
          )
        }
      />
      <ModalResultsRelease
        show={releaseElectionModal}
        onHide={() => setReleaseElectionModal(false)}
        feedback={(message, type) => {
          setFeedbackMessage(message);
          setTypeFeedback(type);
        }}
        shortName={shortName}
      />
    </>
  );

  return (
    <>
      <div id="content-home-admin">
        <section id="header-section" className="parallax hero is-medium">
          <div className="hero-body pt-0 px-0 header-hero">
            <NavbarAdmin />
            <TitlePsifos
              namePage="Panel de Administración"
              nameElection={election.name}
            />
          </div>
        </section>

        <SubNavbar active={1} />

        <section
          className="section voters-section is-flex is-flex-direction-column is-align-items-center"
          id="accordion-section"
        >
          {load && Object.keys(election).length !== 0 ? (
            <div className="container is-max-desktop">
              {feedbackMessage && (
                <div
                  id="feedback-message"
                  className={`notification is-primary ${typeFeedback}`}
                >
                  <button
                    className="delete"
                    onClick={() => setFeedbackMessage("")}
                  ></button>
                  {feedbackMessage}
                </div>
              )}
              <div className="has-text-centered title is-size-4-mobile">
                {election.name}
              </div>
              <hr />
              <div className="columns">
                <div className="column">
                  <CardSettings
                    election={election}
                    setDeleteElectionModal={setDeleteElectionModal}
                  />
                  <CardSteps
                    election={election}
                    electionStep={election.status}
                    freezeModal={() => setFreezeModal(true)}
                    generationReadyModal={() => setGenerationReadyModal(true)}
                    openingReadyModal={() => setOpeningReadyModal(true)}
                    backToSettingModal={() => setBackToSettingModal(true)}
                    closeModal={() => setCloseModal(true)}
                    tallyModal={() => setTallyModal(true)}
                    combineTallyModal={() => setCombineTallyModal(true)}
                    releaseModal={() => setReleaseElectionModal(true)}
                    uploadModalonClick={(value) => setUploadModal(value)}
                  />
                </div>
                <div className="column">
                  <CardInfo
                    election={election}
                    trustees={trustees}
                    electionStep={election.status}
                    updateInfo={updateInfo}
                    totalVoters={totalVoters}
                    totalVotes={totalVotes}
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
    </>
  );
}

export default AdministrationPanel;
