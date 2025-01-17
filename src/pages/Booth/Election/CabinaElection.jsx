import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import { useParams } from "react-router-dom";
import ElectionCode from "../../../component/Footers/ElectionCode";
import QuestionElection from "./QuestionSection/QuestionElection";
import ProgressBar from "../components/ProgressBar";
import React, { useState, useEffect } from "react";
import EncryptingCharging from "../components/EncryptingCharging";
import ReviewQuestions from "./Review/ReviewQuestions";
import CastDone from "../components/CastDone";
import AuditSection from "./Review/AuditSection";
import BoothPsifos from "../BoothPsifos";
import DescriptionModal from "../components/DescriptionModal";

function SelectionPhase(props) {
  return(
    <div
      style={{ display: "block" }}
    >
      <section className="section pb-1" id="question-section">
        <div className="container has-text-centered is-max-desktop">
          <QuestionElection
            election={props.electionData}
            questions={props.questions}
            afterEncrypt={(answersQuestions) => {
              props.setAnswers(answersQuestions);
              props.setActualPhase(3);
            }}
            nextQuestion={(num) => {
              props.setActualQuestion(num);
            }}
            actualQuestion={props.actualQuestion}
            booth={props.BOOTH_PSIFOS.getBooth()}
            encryptQuestions={(answersQuestions) => {
              props.BOOTH_PSIFOS.sendEncryp(answersQuestions);
            }}
            isPreview={props.isPreview}
          />
        </div>
      </section>
    </div>
  )
}

function CabinaElection(props) {
  /** @state {int} election phase */
  const [actualPhase, setActualPhase] = useState(1);

  /** @state {array} list with answers  */
  const [answers, setAnswers] = useState([]);

  /** @state {int} actual voter question  */
  const [actualQuestion, setActualQuestion] = useState(0);

  const [nameElection, setNameElection] = useState("");

  /** @state {array} list with questions  */
  const [questions, setQuestions] = useState([]);

  /** @state {string} vote hash  */
  const [voteHash, setVoteHash] = useState("");

  const [voteVerificated, setVoteVerificates] = useState(null);

  const [modalVerify, setModalVerify] = useState(false);

  const [modalDescription, setModalDescription] = useState(false);

  /** @urlParam {shortName} election shortName  */
  const { shortName } = useParams();
  // Cuadro de dialogo por si el usuario quiere refrescar
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Necesario para que Chrome muestre un mensaje personalizado
    };
    if (actualPhase === 4) {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [actualPhase]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [actualPhase]);

  useEffect(() => {
    if (props.electionData.questions) {
      const questionsFetch = props.electionData.questions;
      questionsFetch.include_informal_options =
        questionsFetch.include_informal_options === "True" ? true : false;
      setQuestions(questionsFetch);
      setNameElection(props.electionData.name);
    }
  }, [props.electionData]);

  useEffect(() => {
    if (props.electionData.description) setModalDescription(true);
  }, [props.electionData.description]);

  useEffect(() => {
    (function(w, d, s, u) {
      w.RocketChat = function(c) { w.RocketChat._.push(c) }; w.RocketChat._ = []; w.RocketChat.url = u;
      var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true; j.src = 'https://chat.labs.clcert.cl/livechat/rocketchat-livechat.min.js?_=201903270000';
      h.parentNode.insertBefore(j, h);
    })(window, document, 'script', 'https://chat.labs.clcert.cl/livechat');
  }, [])
  
  let election_metadata = require("../../../static/dummyData/electionMetadata.json");

  let BOOTH_PSIFOS = new BoothPsifos(
    JSON.stringify(props.electionData),
    election_metadata,
    props.preview
  );

  const sendVote = () => {
    setModalVerify(true);
    BOOTH_PSIFOS.sendJson(shortName).then((res) => {
      setVoteHash(res.encrypted_ballot_hash);

      // Caso en que el voto no se haya realizado correctamente
      if(res.verified === false){
        setVoteVerificates(false);
        setModalVerify(false);
        setActualPhase(4);
      }
    });
  }

  const phases = {
    1: {
      sectionClass: "parallax-02",
      stage: 1,
      component: <SelectionPhase
        electionData={props.selectionData}
        questions={questions}
        setActualPhase={setActualPhase}
        setAnswers={setAnswers}
        setActualQuestion={setActualQuestion}
        actualQuestion={actualQuestion}
        BOOTH_PSIFOS={BOOTH_PSIFOS}
        isPreview={props.preview}
      />,
    },
    2: {
      sectionClass: "parallax-03",
      stage: 2,
      component: <EncryptingCharging />,
    },
    3: {
      sectionClass: "parallax-02",
      stage: 2,
      component: (
        <ReviewQuestions
          election={props.electionData}
          answers={answers}
          questions={questions}
          setVoteVerificates={setVoteVerificates}
          voteHash={voteHash}
          modalVerify={modalVerify}
          changeAnswer={(question) => {
            setActualQuestion(question);
            setActualPhase(1);
          }}
          sendVote={sendVote}
          afterVerify={() => {
            setModalVerify(false);
            setActualPhase(4);
          }}
          audit={() => {
            setActualPhase(5);
          }}
        />
      ),
    },

    4: {
      sectionClass: "parallax-02",
      stage: 3,
      component: (
        <CastDone
          voteVerificated={voteVerificated}
          voteHash={voteHash}
        />
      ),
    },
    5: {
      sectionClass: "parallax-02",
      stage: 4,
      component: (
        <AuditSection
          auditBack={() => {
            setActualPhase(1);
          }}
        />
      ),
    },
  };

  return (
    <div id="content" className={phases[actualPhase].sectionClass}>
      <section className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <MyNavbar linkExit={"https://participa.uchile.cl"} />
          <TitlePsifos
            namePage={
              props.preview
                ? "Previsualización de votación"
                : "Cabina de Votación"
            }
            nameElection={nameElection}
          />
        </div>
      </section>

      <ProgressBar phase={phases[actualPhase].stage} />
      {phases[actualPhase].component}

      <ElectionCode /> {/* footer */}
      <div id="bottom" />
      {actualPhase === 1 && <DescriptionModal
        election={props.electionData}
        show={modalDescription}
        onHide={() => setModalDescription(false)}
      />}
    </div>
  );
}

export default CabinaElection;
