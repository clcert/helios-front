import { backendInfoIp } from "../server";

async function getTotalVoters(shortName) {
    const url = backendInfoIp + "/" + shortName + "/total-voters";
    const resp = await fetch(url, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
    });
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
    }

async function electionHasVoters(shortName) {
    const url = backendInfoIp + "/" + shortName + "/election-has-voters";
    const resp = await fetch(url, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
    });
    const jsonResponse = await resp.json();
    return { resp: resp, jsonResponse: jsonResponse };
    }

export { getTotalVoters, electionHasVoters };
