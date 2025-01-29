import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ElectionCode from "../../../component/Footers/ElectionCode";
import VotersTable from "./components/VotersTable";
import TitlePsifos from "../../../component/OthersComponents/TitlePsifos";
import { Button } from "react-bulma-components";
import SubNavbar from "../component/SubNavbar";
import NavbarAdmin from "../../../component/ShortNavBar/NavbarAdmin";
import UploadModal from "./components/UploadModal";
import DeleteModal from "./components/DeleteModal";
import { getElection } from "../../../services/election";
import DeleteVoterModal from "./components/DeleteVoterModal";
import EditVoterModal from "./components/EditVoterModal";

function VotersList() {
  /**
   * View of the VotersList
   */

  /** @state {bool} open election state */
  const [electionOpenReg, setElectionOpenReg] = useState(false);

  /** @state {array} election info */
  const [election, setElection] = useState([]);

  /** @state {bool} loading state */
  const [load, setLoad] = useState(false);

  /** @state {bool} upload modal state */
  const [uploadModal, setUploadModal] = useState(false);

  /** @state {bool} delete modal state */
  const [deleteModal, setDeleteModal] = useState(false);

  /** @state {bool} delete voter modal state */
  const [deleteVoterModal, setDeleteVoterModal] = useState(false);

  /** @state {bool} delete voter modal state */
  const [editVoterModal, setEditVoterModal] = useState(false);

  const [voterSelect, setVoterSelect] = useState({
    name: "",
    uuid: "",
    username: "",
    weight_init: "",
  });

  /** @urlParam {shortName} election shortName */
  const { shortName } = useParams();

  useEffect(
    function effectFunction() {
      getElection(shortName).then((election) => {
        const { jsonResponse } = election;
        setElection(jsonResponse);
        setElectionOpenReg(jsonResponse.openreg);
        setLoad(true);
      });
    },
    [shortName]
  );

  return (
    <div id="content-home-admin">
      <section className="parallax hero is-medium">
        <div className="hero-body pt-0 px-0 header-hero">
          <NavbarAdmin />
          <TitlePsifos namePage="Padrón" nameElection={election.name} />
        </div>
      </section>

      <SubNavbar active={3} />

      <section className="section voters-section is-flex is-flex-direction-column is-align-items-center">
        {load ? (
          <div>
            <br />
            <div className="d-flex justify-content-center">
              {!electionOpenReg && (
                <>
                  <Button
                    className="btn-fixed button-custom"
                    onClick={() => {
                      setUploadModal(true);
                    }}
                  >
                    <span>Subir votantes</span>
                  </Button>
                  {election.status === "Setting up" && (
                    <Button
                      className="button progress-previous has-text-white has-text-weight-bold ml-3"
                      onClick={() => {
                        setDeleteModal(true);
                      }}
                    >
                      <span>Eliminar Votantes</span>
                    </Button>
                  )}
                </>
              )}
            </div>

            <VotersTable
              election={election}
              setVoterSelect={setVoterSelect}
              setDeleteVoterModal={setDeleteVoterModal}
              setEditVoterModal={setEditVoterModal}
              editVoterModal={editVoterModal}
            />
          </div>
        ) : (
          <div className="spinner-animation"></div>
        )}
      </section>
      <ElectionCode />
      <UploadModal
        show={uploadModal}
        onHide={() => setUploadModal(false)}
        shortName={shortName}
      />
      <DeleteModal show={deleteModal} onHide={() => setDeleteModal(false)} />
      <DeleteVoterModal
        show={deleteVoterModal}
        onHide={() => setDeleteVoterModal(false)}
        voter={voterSelect}
        setVoterSelect={setVoterSelect}
      />
      <EditVoterModal
        show={editVoterModal}
        onHide={() => setEditVoterModal(false)}
        voter={voterSelect}
        setVoterSelect={setVoterSelect}
      />
    </div>
  );
}

export default VotersList;
