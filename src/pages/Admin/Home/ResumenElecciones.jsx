import ModalFreeze from "../AdministrationPanel/component/ModalFreeze";
import ModalCloseElection from "../AdministrationPanel/component/ModalCloseElection";
import ModalTally from "../AdministrationPanel/component/ModalTally";
import ModalCombineTally from "../AdministrationPanel/component/ModalCombineTally";
import ModalResultsRelease from "../AdministrationPanel/component/ModalReleaseResults";
import UploadModal from "../VotersList/components/UploadModal";
import CardElection from "./component/CardElection";
import AlertNotification from "../component/AlertNotification";
import MoreInfoTooltip from "../../../component/MoreInfo/MoreInfoTooltip";
import ResumeTable from "./component/ResumeTable";
import { Button } from "react-bulma-components";
import { useCallback, useState, useEffect } from "react";
import { getElections } from "../../../services/election";
import { setElections } from "../../../store/slices/electionSlice";
import { useDispatch, useSelector } from "react-redux";

function ShowFeedbackMessage({
  feedbackMessage,
  handleFeedbackMessage,
  typeFeedback,
}) {
  return (
    Boolean(feedbackMessage) && (
      <div className={`notification is-primary ${typeFeedback}`}>
        <button className="delete" onClick={handleFeedbackMessage} />
        {feedbackMessage}
      </div>
    )
  );
}

function ResumeTitle() {
  const description =
    "Puede filtrar los procesos que muestra la tabla seleccionando las tarjetas.";
  return (
    <div className="is-flex level event-header">
      <div className="is-size-3">Estado elecciones</div>
      <MoreInfoTooltip descript={description} place="left">
        <i className="fa-solid fa-circle-info more-info-icon" />
      </MoreInfoTooltip>
    </div>
  );
}

function Resume({
  infoMessages,
  electionShowed,
  refreshElections,
  handleInfoMessages,
}) {
  return Object.keys(electionShowed).length > 0 ? (
    <div className="box">
      <AlertNotification alertMessage={infoMessages.success} type="success" />
      <AlertNotification alertMessage={infoMessages.danger} type="danger" />
      <ResumeTitle />
      <ResumeTable
        electionShowed={electionShowed}
        refreshElections={refreshElections}
        handleInfoMessages={handleInfoMessages}
      />
    </div>
  ) : (
    <div />
  );
}

function ElectionList({
  electionsPage,
  electionSelected,
  electionSelectedHandler,
  freezeModalHandler,
  closeModalHandler,
  tallyModalHandler,
  combineTallyHandler,
  uploadModalHandler,
  releaseModalHandler,
}) {
  return electionsPage.map((election, index) => {
    const modalParams = {
      state: true,
      shortName: election.short_name,
    };
    return (
      <CardElection
        key={index}
        election={election}
        electionStatus={election.status}
        electionSelected={electionSelected}
        handlerElectionSelected={electionSelectedHandler(election)}
        freezeModal={() => freezeModalHandler(modalParams)}
        closeModal={() => closeModalHandler(modalParams)}
        releaseModal={() => releaseModalHandler(modalParams)}
        tallyModal={() => tallyModalHandler(modalParams)}
        combineTallyModal={() => combineTallyHandler(modalParams)}
        uploadModalonClick={(_) => uploadModalHandler(modalParams)}
      />
    );
  });
}

function ElectionListButton({ isDisabled, onClickHandler, message }) {
  return (
    <div className="d-flex">
      <Button
        className="button-custom home-admin-button is-size-7-mobile"
        disabled={isDisabled}
        onClick={onClickHandler}
      >
        {message}
      </Button>
    </div>
  );
}

function ElectionListButtons({
  isPreviousDisabled,
  previousHandler,
  isNextDisabled,
  nextHandler,
}) {
  return (
    <div className="d-flex justify-content-between mt-4">
      <ElectionListButton
        isDisabled={isPreviousDisabled}
        onClickHandler={previousHandler}
        message="Anterior"
      />
      <ElectionListButton
        isDisabled={isNextDisabled}
        onClickHandler={nextHandler}
        message="Siguiente"
      />
    </div>
  );
}

function GeneralAdmin() {
  const dispatch = useDispatch();
  const elections = useSelector((state) => state.election.elections);

  /** @state {array} elections showed in the election */
  const [electionsPage, setElectionsPage] = useState([]);

  /** @state {number} page elections */
  const [actualPage, setActualPage] = useState(0);

  /** @state {json} state modal freeze */
  const [freezeModal, setFreezeModal] = useState({
    state: false,
    shortName: "",
  });

  /** @state {json} state modal close election */
  const [closeModal, setCloseModal] = useState({ state: false, shortName: "" });

  /** @state {json} state modal release results */
  const [releaseModal, setReleaseModal] = useState({
    state: false,
    shortName: "",
  });

  /** @state {json} tally modal close election */
  const [tallyModal, setTallyModal] = useState({ state: false, shortName: "" });

  /** @state {json} state modal combine tally election */
  const [combineTallyModal, setCombineTallyModal] = useState({
    state: false,
    shortName: "",
  });

  /** @state {string} message with feeback for admin */
  const [feedbackMessage, setFeedbackMessage] = useState("");

  /** @state {string} feeback type for admin */
  const [typeFeedback, setTypeFeedback] = useState("");

  /** @state {bool} state for load information from backend */
  const [load, setLoad] = useState(false);

  /** @state {bool} upload modal state */
  const [uploadModal, setUploadModal] = useState({
    state: false,
    shortName: "",
  });

  /** @state {object} Total election to show */
  const [electionsRecount, setElectionsRecount] = useState({});

  /** @state {object} Selected election to show */
  const [electionSelected, setElectionSelected] = useState([]);

  /** @state {object} Selected election to show */
  const [electionShowed, setElectionShowed] = useState({});

  /** @state {object} Messages feedback */
  const [infoMessages, setInfoMessages] = useState({
    danger: "",
    success: "",
  });

  const electionsForPage = 3;
  const nextDisabled =
    actualPage * electionsForPage + electionsForPage >= elections.length;
  const previousDisabled = actualPage === 0;

  function updateElectionStatus(shortName, status) {
    let auxElections = elections;
    for (let i = 0; i < auxElections.length; i++) {
      if (auxElections[i].short_name === shortName) {
        auxElections[i].status = status;
      }
    }
    setElections(auxElections);
  }

  const updateElections = useCallback(() => {
    const selectedElections = elections.slice(
      actualPage * electionsForPage,
      actualPage * electionsForPage + electionsForPage
    );
    setElectionsPage(selectedElections);
  }, [actualPage, elections]);

  useEffect(() => {
    setElectionsPage([]);
    updateElections();
  }, [actualPage, updateElections]);

  /**
   * Check if decryptions can be combined
   *
   * @param {*} election to check
   * @returns bool
   *
   * @author Cristóbal Jaramillo
   */
  const canCombineDecryptions = (election) => {
    return (
      election.status === "Decryptions uploaded" ||
      (election.status === "Tally computed" &&
        election.decryptions_uploaded >=
          Math.floor(election.total_trustees / 2) + 1)
    );
  };

  const setElectionData = useCallback(() => {
    const auxJson = {};
    elections.forEach((election) => {
      let status = election.status;
      if (canCombineDecryptions(election)) {
        status = "Can combine decryptions";
      }
      auxJson[status] =
        status in auxJson ? [...auxJson[status], election] : [election];
    });

    setElectionsRecount(auxJson);
    setElectionShowed(auxJson);
    setElectionSelected({});
    setLoad(true);
  }, [elections]);

  /**
   * Refreshes elections in case of changes
   *
   * @author Cristóbal Jaramillo
   */
  const refreshElections = () => {
    getElections().then((res) => {
      const { resp, jsonResponse } = res;
      if (resp.status === 200) {
        dispatch(setElections(jsonResponse));
        setElectionData();
      }
    });
  };

  /**
   * Action of selecting an election
   *
   * @param {object} election selected
   * @param {boolean} checked
   *
   * @author Cristóbal Jaramillo
   */

  const handlerElectionSelected = (election, checked) => {
    let status = election.status;

    if (canCombineDecryptions(election)) {
      status = "Can combine decryptions";
    }
    let selected = { ...electionSelected };
    if (checked) {
      selected[status] =
        status in selected ? [...selected[status], election] : [election];
    } else {
      selected[status] = selected[status].filter(
        (item) => item.short_name !== election.short_name
      );
    }

    setElectionSelected(selected);
    setElectionShowed(selected);
  };

  const setShowingElections = useCallback(() => {
    let auxElectionSelected = electionSelected;
    if (
      Object.values(electionSelected).every(
        (arr) => Array.isArray(arr) && arr.length === 0
      )
    ) {
      auxElectionSelected = electionsRecount;
    }
    setElectionShowed(auxElectionSelected);
  }, [electionSelected, electionsRecount]);

  /**
   * Discriminate between showing all or selected ones
   */
  useEffect(() => {
    setShowingElections();
  }, [setShowingElections]);

  useEffect(() => {
    setElectionData();
  }, [setElectionData]);

  return (
    <>
      <>
        <div className="is-flex is-flex-direction-column is-align-items-center">
          {load ? (
            <div className="container is-max-desktop">
              <ShowFeedbackMessage
                feedbackMessage={feedbackMessage}
                handleFeedbackMessage={() => setFeedbackMessage("")}
                typeFeedback={typeFeedback}
              />
              <Resume
                infoMessages={infoMessages}
                electionShowed={electionShowed}
                refreshElections={refreshElections}
                handleInfoMessages={setInfoMessages}
              />
              <div className="box">
                <div className="is-size-3 mb-2">Listado elecciones</div>
                <ElectionList
                  electionsPage={electionsPage}
                  electionSelected={electionSelected}
                  electionSelectedHandler={(election) => {
                    return (checked) =>
                      handlerElectionSelected(election, checked);
                  }}
                  freezeModalHandler={setFreezeModal}
                  closeModalHandler={setCloseModal}
                  releaseModalHandler={setReleaseModal}
                  tallyModalHandler={setTallyModal}
                  combineTallyHandler={setCombineTallyModal}
                  uploadModalHandler={setUploadModal}
                />
                <ElectionListButtons
                  isPreviousDisabled={previousDisabled}
                  previousHandler={() => setActualPage(actualPage - 1)}
                  isNextDisabled={nextDisabled}
                  nextHandler={() => setActualPage(actualPage + 1)}
                />
              </div>
            </div>
          ) : (
            <div className="spinner-animation" />
          )}
        </div>

        <ModalFreeze
          show={freezeModal.state}
          onHide={() => setFreezeModal(false)}
          freezeChange={() =>
            updateElectionStatus(freezeModal.shortName, "Started")
          }
          feedback={(message, type) => {
            setFeedbackMessage(message);
            setTypeFeedback(type);
          }}
          shortName={freezeModal.shortName}
        />
        <ModalCloseElection
          show={closeModal.state}
          onHide={() => setCloseModal(false)}
          endChange={() => updateElectionStatus(closeModal.shortName, "Ended")}
          feedback={(message, type) => {
            setFeedbackMessage(message);
            setTypeFeedback(type);
          }}
          shortName={closeModal.shortName}
        />

        <ModalTally
          show={tallyModal.state}
          onHide={() => setTallyModal(false)}
          tallyChange={() =>
            updateElectionStatus(tallyModal.shortName, "Tally computed")
          }
          feedback={(message, type) => {
            setFeedbackMessage(message);
            setTypeFeedback(type);
          }}
          shortName={tallyModal.shortName}
        />

        <ModalResultsRelease
          show={releaseModal.state}
          onHide={() => setReleaseModal(false)}
          feedback={(message, type) => {
            setFeedbackMessage(message);
            setTypeFeedback(type);
          }}
          shortName={releaseModal.shortName}
        />

        <ModalCombineTally
          show={combineTallyModal.state}
          onHide={() => setCombineTallyModal(false)}
          combineChange={() =>
            updateElectionStatus(
              combineTallyModal.shortName,
              "Decryptions combined"
            )
          }
          feedback={(message, type) => {
            setFeedbackMessage(message);
            setTypeFeedback(type);
          }}
          shortName={combineTallyModal.shortName}
        />

        <UploadModal
          show={uploadModal.state}
          onHide={() => setUploadModal(false)}
          shortName={uploadModal.shortName}
        />
      </>
    </>
  );
}

export default GeneralAdmin;
