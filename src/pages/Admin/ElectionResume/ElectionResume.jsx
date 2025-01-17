import imageTrustees from "../../../static/svg/trustees-list.svg";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import ImageFooter from "../../../component/Footers/ImageFooter";
import InfoElection from "./components/InfoElection";
import ElectionCode from "../../../component/Footers/ElectionCode";
import NavbarAdmin from "../../../component/ShortNavBar/NavbarAdmin";
import { useParams } from "react-router";
import { useEffect, useState, useCallback } from "react";
import SubNavbar from "../component/SubNavbar";
import {
  getStats, getElectionPublic,
  getVotersInit,
  getVotesInit,
  getVotesEnd
} from "../../../services/election";

function ElectionResume() {
  /**
   * view to summarize the election
   */

  /** @state {string} name of election */
  const [nameElection, setNameElection] = useState("");

  const [votersWeightsInit, setVotersWeightsInit] = useState({});

  const [votesWeightsInit, setVotesWeightInit] = useState({});

  const [votesWeightEnd, setVotesWeightsEnd] = useState({});
  
  const [maxWeight, setMaxWeight] = useState();

  /** @state {string} state of loading data */
  const [load, setLoad] = useState(false);

  /** @urlParam {string} shortName of election */
  const { shortName } = useParams();

  const getElectionResult = useCallback(async () => {
    getElectionPublic(shortName).then((election) => {
      const { resp, jsonResponse } = election;
      if (resp.status === 200) {
        jsonResponse.max_weight && setMaxWeight(
          jsonResponse.max_weight
        )
      }
    });
  }, [shortName]);

  useEffect(() => {
    getElectionResult();
  }, [getElectionResult]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votersInitData, votesInitData, votesEndData, statsData] = await Promise.all([
          getVotersInit(shortName),
          getVotesInit(shortName),
          getVotesEnd(shortName),
          getStats(shortName)
        ]);

        setVotersWeightsInit(votersInitData.jsonResponse.voters_by_weight_init);
        setVotesWeightInit(votesInitData.jsonResponse.votes_by_weight);
        setVotesWeightsEnd(votesEndData.jsonResponse.votes_by_weight_end);
        setNameElection(statsData.jsonResponse.name);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoad(true);
      }
    };

    fetchData();
  }, [shortName]);

  return (
    <div id="content-home-admin">
      <section className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <NavbarAdmin />
          <TitlePsifos
            namePage="Resumen de Elección"
            nameElection={nameElection}
          />
        </div>
      </section>

      <SubNavbar active={2} />

      <InfoElection
        load={load}
        weightsInit={votersWeightsInit}
        weightsEnd={votesWeightsInit}
        weightsElection={votesWeightEnd}
        maxWeight={maxWeight}
      />

      <ImageFooter imagePath={imageTrustees} />
      <ElectionCode />
    </div>
  );
}

export default ElectionResume;
