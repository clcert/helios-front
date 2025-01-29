import { backendInfoIp, backendOpIP } from "../server";
import { logout } from "../utils/utils";

async function getElection(shortName) {
  /**
   * async function to get the election data
  */
   const token = localStorage.getItem("token");
  const resp = await fetch(backendOpIP + "/get-election/" + shortName, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();

    return { resp: resp, jsonResponse: jsonResponse };
  } else if (resp.status === 403) {
    logout();
  }
}

async function getElectionPublic(shortName) {
  /**
   * async function to get the election data
   */

  const resp = await fetch(backendInfoIp + "/election/" + shortName, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getElections() {
  /**
   * Get all elections for the current admin
   */

  const token = localStorage.getItem("token");
  const resp = await fetch(backendOpIP + "/get-elections", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  } else if (resp.status === 403) {
    logout();
  }
}

async function getStats(shortName) {
  const resp = await fetch(backendInfoIp + "/get-election-stats/" + shortName, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getEvents(shortName) {
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
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getStatsGroup(shortName, group) {
  group = group === "Sin grupo" ? "" : group;
  const resp = await fetch(backendInfoIp + "/get-election-group-stats/" + shortName, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      group: group
    })
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getVotersInit(shortName) {
  const resp = await fetch(`${backendInfoIp}/${shortName}/voters-by-weight-init/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp, jsonResponse };
  }
}

async function getVotesInit(shortName) {
  const resp = await
    await fetch(`${backendInfoIp}/${shortName}/votes-by-weight-init/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getVotesEnd(shortName) {
  const resp = await fetch(`${backendInfoIp}/${shortName}/votes-by-weight-end/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function getCountDates(shortName, deltaTime) {
  /**
   * async function to get the number of votes by date
   */

  const resp = await fetch(backendInfoIp + "/" + shortName + "/count-dates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      minutes: deltaTime,
    }),
  });

  if (resp.status === 200) {
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
  }
}

async function initElection(shortName) {
  /**
   * Init election
   */

  const token = localStorage.getItem("token");
  const url = backendOpIP + "/" + shortName + "/start-election";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 403) {
    logout();
  }
  return resp
}

async function closeElection(shortName) {
  /**
   * Init election
   */

  const token = localStorage.getItem("token");
  const url = backendOpIP + "/" + shortName + "/end-election";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 403) {
    logout();
  }
  return resp
}

async function computeTally(shortName) {
  /**
   * Compute tally election
   */

  const token = localStorage.getItem("token");
  const url = backendOpIP + "/" + shortName + "/compute-tally";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 403) {
    logout();
  }
  return resp
}

async function combineDecryptions(shortName) {
  /**
   * Combine decryptions
   */

  const token = localStorage.getItem("token");
  const url = backendOpIP + "/" + shortName + "/combine-decryptions";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });

  if (resp.status === 403) {
    logout();
  }
  return resp
}

async function getQuestions(shortName) {
  const resp = await fetch(backendInfoIp + "/" + shortName + "/get-questions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const jsonResponse = await resp.json();
  return { resp: resp, jsonResponse: jsonResponse };
}

async function electionHasQuestions(shortName) {
  const url = backendInfoIp + "/" + shortName + "/election-has-questions";
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const jsonResponse = await resp.json();
  return { resp: resp, jsonResponse: jsonResponse };
}

async function checkStatus(shortName) {
  const url = backendInfoIp + "/" + shortName + "/check-status";
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const jsonResponse = await resp.json();
  return { resp: resp, jsonResponse: jsonResponse };
}

export {
  getElection,
  getElectionPublic,
  getElections,
  getStats,
  getStatsGroup,
  getEvents,
  getVotersInit,
  getVotesInit,
  getVotesEnd,
  getCountDates,
  initElection,
  closeElection,
  computeTally,
  combineDecryptions,
  getQuestions,
  electionHasQuestions,
  checkStatus
};
