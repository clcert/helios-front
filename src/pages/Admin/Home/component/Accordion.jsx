import React, { useCallback, useEffect, useRef, useState } from "react";
import bulmaCollapsible from "@creativebulma/bulma-collapsible";
import "../../../../static/booth/css/booth.scss";
import { Link } from "react-router-dom";
import { electionStatus } from "../../../../constants";


function Accordion({ election }) {
  const collapsiblesRef = useRef(null);
  const [show, setShow] = useState(false);
  const [stateElection, setStateElection] = useState("");

  const determineState = useCallback(() => {
    const statusMap = {
      [electionStatus.settingUp]: "En configuración",
      [electionStatus.readyForKeyGeneration]: "Generación de claves",
      [electionStatus.readyForOpening]: "Apertura de elección",
      "Started": "En curso",
    };
    setStateElection(statusMap[election.status] || "Finalizada");
  }, [election.status]);

  useEffect(() => {
    bulmaCollapsible.attach(".is-collapsible", {
      container: collapsiblesRef.current,
    });
    determineState();
  }, [determineState]);

  const links = [
    { path: "panel", label: "Configuraciones" },
    { path: "resumen", label: "Resumen" },
    { path: "voters-list", label: "Padrón" },
    { path: "trustee", label: "Custodios" },
    { path: "resultado", label: "Resultados" },
    { path: "statistics", label: "Estadísticas" },
  ];

  const renderLinks = (start, end) => {
    return links.slice(start, end).map((link) => (
      <div key={link.path} className="row-accordion is-full">
        <Link
          to={`/psifos/admin/${election.short_name}/${link.path}`}
          className="accordion-link"
        >
          {link.label}
        </Link>
      </div>
    ));
  };

  return (
    <div ref={collapsiblesRef} id="accordion_first">
      <div className="card-accordion">
        <a
          href="#collapsible-card"
          onClick={() => {
            setShow(!show);
          }}
          data-action="collapse"
          className="card-header-icon is-hidden-fullscreen pt-0 pr-0 pb-0 accordion-a"
        >
          <header className="card-header accordion-header p-2">
            <p className="card-header-title accordion-title mb-0">
              {election.short_name}
            </p>
            <span className="accordion-state">{stateElection}</span>

            <span className="icon">
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </header>
        </a>
        {show ? (
          <div
            id="collapsible-card"
            className="is-collapsible"
            style={{ overflowX: "hidden" }}
          >
            <div className="card-content accordion-content pl-4">
              <div className="columns pl-3 pr-3">
                <div className="rows column">{renderLinks(0, 3)}</div>
                <div className="rows column">{renderLinks(3, 6)}</div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Accordion;
