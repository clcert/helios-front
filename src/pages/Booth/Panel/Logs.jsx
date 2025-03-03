import { useCallback, useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { backendInfoIp } from "../../../server";
import { events } from "../../../constants";
import NotAvalaibleMessage from "../../../component/Messages/NotAvailableMessage";
import MoreInfoTooltip from "../../../component/MoreInfo/MoreInfoTooltip";

function EventHeader({ event, descript }) {
  return (
    <div className="is-flex level event-header">
      <div className="title">
        <i className="fa-solid fa-check check-icon" /> {event} <br />
      </div>
      <MoreInfoTooltip descript={descript}>
        <i className="fa-solid fa-circle-info more-info-icon" />
      </MoreInfoTooltip>
    </div>
  );
}

function EventInfo({ created_at, event_params, event_detail }) {
  return (
    <div className="event-info">
      <span> {created_at}</span>
      <br />
      {JSON.stringify(event_params) !== "{}" && event_params.name && (
        <span>
          {event_detail}
          {event_params.name}
        </span>
      )}
    </div>
  );
}

function RegisteredEvents({ electionLogs }) {
  return (
    <>
      {electionLogs.map((logs, index) => {
        return (
          <div key={index} className="box logs-box">
            <div className="is-size-5">
              <EventHeader
                event={events[logs.event].name}
                descript={events[logs.event].descript}
              />
              <hr />
              <EventInfo
                created_at={new Date(logs.created_at).toLocaleString()}
                event_params={JSON.parse(logs.event_params)}
                event_detail={events[logs.event].detail}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

function Logs() {
  const [electionLogs, setElectionLogs] = useState([]);
  const [load, setLoad] = useState(false);
  const { shortName } = useParams();
  const getLogs = useCallback(async () => {
    const resp = await fetch(
      backendInfoIp + "/election/" + shortName + "/election-logs",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (resp.status === 200) {
      const jsonResponse = await resp.json();
      setElectionLogs(jsonResponse);
      setLoad(true);
    }
  }, [shortName]);

  const initComponent = useCallback(() => {
    getLogs();
    const interval = setInterval(() => {
      getLogs();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [getLogs]);

  useEffect(() => {
    initComponent();
  }, [initComponent]);

  return (
    <>
      {load ? (
        electionLogs.length !== 0 ? (
          <RegisteredEvents electionLogs={electionLogs} />
        ) : (
          <NotAvalaibleMessage message="Sin eventos registrados" />
        )
      ) : (
        <div className="spinner-animation"></div>
      )}
    </>
  );
}

export default Logs;
