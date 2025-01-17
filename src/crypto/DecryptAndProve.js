import { backendOpIP } from "../server";

import Crypto from "./Crypto";
import { getEgParams } from "../services/crypto";

export default class DecryptAndProve extends Crypto {
  constructor(shortName, index, setFeedbacks, { reactFunctions } = {}) {
    super({ reactFunctions });

    this.shortName = shortName;
    this.setFeedbacks = setFeedbacks;
    this.index = index;

    this.params = null;
    this.certificates = null;
    this.points = null;
    this.election = null;
    this.trustee = null;
    this.trusteeCrypto = null;
    this.descriptions = {};
    this.workers = {};
    this.resultWorkers = {};
    this.workersQuestions = {};
    this.finalTally = [];
    this.totalWorkers = navigator.hardwareConcurrency
      ? Math.max(navigator.hardwareConcurrency, 4)
      : 1;
    this.questionsComplete = {};
    this.totalTally = {};
    this.lengthTally = null;
  }

  async getDecrypt() {
    const url =
      backendOpIP +
      "/" +
      this.shortName +
      "/trustee/decrypt-and-prove";
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  }

  async sendDecrypt(descriptions) {
    this.reactFunction("setFeedbackMessage", "Enviando información...");
    this.setFeedbacks(this.index, "Enviando información...");
    const url =
      backendOpIP +
      "/" +
      this.shortName +
      "/trustee/decrypt-and-prove";
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(descriptions),
    });
    if (response.status === 200) {
      this.reactFunction(
        "setFeedbackMessage",
        "Desencriptación Parcial Completada ✓"
      );
      this.setFeedbacks(this.index, "Desencriptación Parcial Completada ✓");
      this.reactFunction("setActualStep", 2);
      const jsonResponse = await response.json();
      return jsonResponse;
    } else {
      this.reactFunction(
        "setFeedbackMessage",
        "Error al enviar información, intente nuevamente"
      );
      this.setFeedbacks(
        this.index,
        "Error al enviar información, intente nuevamente"
      );
      this.reactFunction("setActualStep", 0);
    }
  }

  createWorker(bash, sk, q_num, worker_num, group, with_votes) {
    const worker = new Worker(new URL("./decrypt-worker.js", import.meta.url));
    worker.postMessage({
      params: this.params,
      trustee: this.trustee,
      trustee_crypto: this.trusteeCrypto,
      election: this.election,
      secretKey: sk,
      certificates: this.certificates,
      points: this.points,
      tally: bash,
    });

    const self = this;

    const checkAndSendAux = this.check_and_send.bind(this);
    const reactFunction = this.reactFunction.bind(this);

    worker.onmessage = function (event) {
      if (event.data.type === "log") return console.log(event.data.msg);
      if (event.data.type === "error") {
        reactFunction("setFeedbackMessage", event.data.message);
        reactFunction("setActualStep", 0);
        return;
      }
      if (event.data.type === "result") {
        const tally_factors_and_proof = event.data.tally_factors_and_proof;

        // Guardamos los tally de cada worker
        self.resultWorkers[group][q_num][worker_num] = tally_factors_and_proof;
        self.workers[group][q_num] = self.workers[group][q_num] + 1;

        // Si es el ultimo worker, une las desencriptaciones
        if (
          self.workers[group][q_num] === self.workersQuestions[group][q_num]
        ) {
          let factor_proofs = {
            decryption_factors: [],
            decryption_proofs: [],
            tally_type: "",
          };

          // Resultados ordenados
          self.resultWorkers[group][q_num].forEach((result) => {
            factor_proofs.decryption_factors =
              factor_proofs.decryption_factors.concat(
                result.decryption_factors
              );
            factor_proofs.decryption_proofs =
              factor_proofs.decryption_proofs.concat(result.decryption_proofs);
            factor_proofs.tally_type = result.tally_type;
          });
          self.descriptions[group][q_num] = factor_proofs;
          self.questionsComplete[group] = self.questionsComplete[group] + 1;
        }
        // En caso de que terminamos todas las preguntas
        if (self.questionsComplete[group] === self.totalTally[group]) {
          self.finalTally.push({
            group: group,
            with_votes: with_votes,
            decryptions: self.descriptions[group],
          });
          checkAndSendAux();
        }
      }
    };
  }

  check_and_send() {
    if (this.lengthTally === this.finalTally.length) {
      this.sendDecrypt(this.finalTally);
    }
  }

  handlerDecrypt = async (sk) => {
    try {
      const eg_params = await getEgParams(this.shortName);
      const data = await this.getDecrypt();

      this.params = JSON.parse(eg_params);
      this.certificates = JSON.parse(data.certificates);
      this.points = JSON.parse(data.points);
      this.election = data.election;
      this.trustee = data.trustee;
      this.trusteeCrypto = data.trustee_crypto;
      this.encryptedTally = data.encrypted_tally;

      if (!sk) {
        this.reactFunction(
          "setFeedbackMessage",
          "Formato de archivo incorrecto"
        );
        this.setFeedbacks(this.index, "Formato de archivo incorrecto");
        this.reactFunction("setActualStep", 0);
        return;
      }

      const groupedTally = this.encryptedTally.reduce((acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
      }, {});

      Object.values(groupedTally).forEach((items) => {
        if (items[0].with_votes) {
          this.lengthTally += 1;
        }
      });

      for (const [group, items] of Object.entries(groupedTally)) {
        if (items[0].with_votes) {
          this.doTally(items, sk, group, items[0].with_votes);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  doTally = (tally, sk, group, with_votes) => {
    this.totalTally[group] = tally.length;
    this.questionsComplete[group] = 0;
    this.workers[group] = [];
    this.resultWorkers[group] = [];
    this.workersQuestions[group] = [];
    this.descriptions[group] = [];

    tally.forEach((t, q_num) => {
      t.encrypted_tally = JSON.parse(t.encrypted_tally);
      const size = Math.ceil(t.encrypted_tally.length / this.totalWorkers);
      this.workers[group][q_num] = 0;
      this.resultWorkers[group][q_num] = [];

      const workerCount = size < 10 ? 1 : this.totalWorkers;
      this.workersQuestions[group][q_num] = workerCount;

      for (let i = 0; i < workerCount; i++) {
        const bash = size < 10 ? t : { ...t, tally: t.encrypted_tally.slice(size * i, size * (i + 1)) };
        this.createWorker(bash, sk, q_num, i, group, with_votes);
      }
    });
  };
}
