export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/psifos/admin/login";
}

export function translateStep(step) {
  const steps = {
    "Setting up": "En configuración",
    "Started": "Iniciada",
    "Ended": "Finalizada",
    "Computing Tally": "Computando Tally",
    "Tally computed": "Tally computado",
    "Decryptions uploaded": "Desencriptaciones subidas",
    "Decryptions combined": "Desencriptaciones combinadas",
    "Results released": "Resultados liberados",
    "Can combine decryptions": "Puede combinar desencriptaciones",
  }
  return Object.keys(steps).includes(step) && steps[step]
}

/**
 *
 * Returns a normalized string with NFD
 *
 * @param {string} phrase phrase to normalize
 * @returns string normalized
 */
export function normalizedLowerCase(phrase) {
  const phraseLowerCase = phrase.toLowerCase();
  const phraseNormalized = phraseLowerCase
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return phraseNormalized;
}

export const singularOrPlural = (singular, plural, count) => {
  if (count === 1) { return singular }
  if (Boolean(plural)) { return plural }
  return `${singular}s`
}


export const searchTrusteeCrypto = (trustee, election_id) => {
  const trusteeCrypto = trustee.trustee_crypto.find(
    (tc) => tc.election_id === election_id
  );
  return trusteeCrypto;
}