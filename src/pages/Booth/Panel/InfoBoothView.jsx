import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import FooterParticipa from "../../../component/Footers/FooterParticipa";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import MyNavbar from "../../../component/ShortNavBar/MyNavbar";
import { getElectionPublic } from "../../../services/election";
import Results from "../../Admin/Results/Results";
import CastVoteView from "./CastVoteView";
import SubNavbarBooth from "./components/SubNavbarBooth";
import LoggerBoth from "./LoggerBooth";
import StatisticsBooth from "./StatisticsBooth";
import VerifyElection from "./VerifyElection";

function InfoBoothView() {
  const [election, setElection] = useState("");
  const [activeNumber, setActiveNumber] = useState(0);

  /** @urlParam {string} shortName of election */
  const { shortName } = useParams();

  useEffect(() => {
    getElectionPublic(shortName).then((data) => {
      const { jsonResponse } = data;
      setElection(jsonResponse);
      setActiveNumber(jsonResponse.status.includes("released") ? 3 : 0);
    });
  }, [shortName]);

  useEffect(() => {
    (function(w, d, s, u) {
      w.RocketChat = function(c) { w.RocketChat._.push(c) }; w.RocketChat._ = []; w.RocketChat.url = u;
      var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true; j.src = 'https://chat.labs.clcert.cl/livechat/rocketchat-livechat.min.js?_=201903270000';
      h.parentNode.insertBefore(j, h);
    })(window, document, 'script', 'https://chat.labs.clcert.cl/livechat');
  }, [])

  return (
    <div id="content-home-admin">
      <section id="header-section" className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <MyNavbar linkExit="https://participa.uchile.cl" linkInit="" />

          <TitlePsifos
            namePage="Portal de Información"
            nameElection={election.name}
          />
        </div>
      </section>

      <SubNavbarBooth
        active={activeNumber}
        changeActive={(number, name) => {
          setActiveNumber(number);
        }}
      />

      <section
        className="section is-flex is-align-items-center is-flex-direction-column"
        id="results-section"
      >
        {activeNumber === 0 && <CastVoteView election={election} />}
        {activeNumber === 1 && <StatisticsBooth />}
        {activeNumber === 2 && <LoggerBoth />}
        {activeNumber === 3 && <Results />}
        {activeNumber === 4 && <VerifyElection
          includesMnQuestion={election.questions.includes("mixnet") || election.questions.includes("stvnc")}
        />}
      </section>

      <FooterParticipa message="SEGURIDAD ∙ TRANSPARENCIA ∙ VERIFICACIÓN" />
    </div>
  );
}

export default InfoBoothView;
