import { backendOpIP } from "../server";

async function getEgParams(uuid) {
  /**
   * async function to get the eg params
   * @returns {object} data response
   */
  const url = backendOpIP + "/" + uuid + "/get-eg-params";

  const resp = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const jsonResponse = await resp.json();
  return jsonResponse["mixnet_params"];
}

async function getCheckSk(uuid) {
  const url =
    backendOpIP + "/" + uuid + "/trustee/check-sk";
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

export { getEgParams, getCheckSk };
