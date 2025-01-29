import { BigInt } from "../static/booth/js/jscrypto/bigint";
import { sjcl } from "../static/booth/js/jscrypto/sjcl";
import { ElGamal } from "../static/booth/js/jscrypto/elgamal";
import Heliosc, { helios_c } from "../static/booth/js/jscrypto/heliosc-trustee";
import { backendOpIP } from "../server";

import { getTrusteeCrypto } from "../services/trustee";
import { getEgParams } from "../services/crypto";

import Crypto from "./Crypto";
import { trusteeStep } from "../constants";

export default class KeyGenerator extends Crypto {
  constructor(shortName, index, setSteps, { reactFunctions } = {}) {
    
    super({ reactFunctions });

    this.shortName = shortName;
    this.trustee = {};
    this.trusteeCrypto = {};
    this.elGamalParams = {};
    this.secretKey = "";
    this.certificateCache = {};
    this.certificate = {};
    this.trusteeStep = 0;
    this.execute = false;
    this.coefficents = [];
    this.sent = [];
    this.acks = [];
    this.ack2 = [];
    this.interval = null;
    this.helios_c = new Heliosc();
    this.index = index;
    this.setSteps = setSteps;
    this.feedback = "";

    this.derivatorPk = {};

    this.acknowledgerPk = {};

    this.checkAcksPk = {};
  }

  async initParams() {
    sjcl.random.startCollectors();
    try {
      const trusteeData = await getTrusteeCrypto(this.shortName);
      const trustee = trusteeData.jsonResponse.trustee;
      const trustee_crypto = trusteeData.jsonResponse.trustee_crypto;
      this.trustee = trustee;
      this.trusteeCrypto = trustee_crypto;
      this.reactFunction("setActualStep", trustee_crypto.current_step);

      const egParamsData = await getEgParams(this.shortName);
      const eg_params_json = JSON.parse(egParamsData);

      const randomnessData = await this.getRandomness();
      sjcl.random.addEntropy(randomnessData);

      let elgamal_params = ElGamal.Params.fromJSONObject(eg_params_json);
      elgamal_params.trustee_id = trustee_crypto.trustee_election_id;
      this.helios_c.trustee = this.helios_c.trustee_create(elgamal_params);
      this.elGamalParams = elgamal_params;

      const self = this;
      BigInt.setup(function () {
        elgamal_params = ElGamal.Params.fromJSONObject(eg_params_json);
        elgamal_params.trustee_id = trustee_crypto.trustee_election_id;
        self.helios_c.trustee = self.helios_c.trustee_create(elgamal_params);
      });

      this.reactFunction("setEnabledButtonInit", true);
      this.setStepInit(trustee_crypto.current_step);
    } catch (error) {
      console.error("Error initializing parameters:", error);
    }
  }

  derivatorCoeff(i) {
    if (i <= this.helios_c.params.t) {
      this.coefficents[i] = this.helios_c.trustee.generate_coefficient(i);
      this.derivatorCoeff(i + 1);
    } else {
      this.derivatorPoint(0);
    }
  }

  derivatorPoint(i) {
    if (i < parseInt(this.helios_c.params.l)) {
      var id = i + 1;
      this.derivatorPk.y = new BigInt(this.helios_c.certificates[i].encryption_key);
      this.helios_c.points[i] = this.helios_c.trustee.generate_point(
        id,
        this.derivatorPk
      );
      this.derivatorPoint(i + 1);
    } else {
      const coefficients = JSON.stringify(this.coefficents);
      const points = JSON.stringify(this.helios_c.points);
      this.sendStep(
        1,
        JSON.stringify({ coefficients: coefficients, points: points })
      );
    }
  }

  derivatorStart() {
    this.derivatorPk = {
      g: this.helios_c.params.g,
      p: this.helios_c.params.p,
      q: this.helios_c.params.q,
    };
    this.derivatorCoeff(0);
  }

  acknowledgerTrustee(i) {
    if (i < parseInt(this.helios_c.params.l)) {
      var id = i + 1;
      var pk = this.acknowledgerPk;
      pk.y = new BigInt(this.helios_c.certificates[i].signature_key);
      var ack = this.helios_c.trustee.check_point(
        id,
        pk,
        this.helios_c.points[i],
        this.coefficents[i]
      );
      if (ack) {
        this.acks[i] = ack;
        this.acknowledgerTrustee(i + 1);
      } else {
        console.log("Points from trustee #" + id + " failed validation!");
      }
    } else {
      this.acknowledgements = JSON.stringify(this.acks);
      const ack = this.acknowledgements;
      this.sendStep(2, JSON.stringify({ acknowledgements: ack }));
    }
  }

  acknowledgerStart() {
    this.acknowledgerPk = {
      g: this.helios_c.params.g,
      p: this.helios_c.params.p,
      q: this.helios_c.params.q,
    };
    this.acknowledgerTrustee(0);
  }

  checkAcksTrustee(i) {
    if (i < parseInt(this.helios_c.params.l)) {
      var id = i + 1;
      const checkAcksPkAux = this.checkAcksPk;
      const self = this;
      setTimeout(function () {
        var pk = checkAcksPkAux;
        pk.y = new BigInt(self.helios_c.certificates[i].signature_key);
        if (self.helios_c.trustee.check_ack(id, pk, self.sent[i], self.ack2[i])) {
          setTimeout(function () {
            self.checkAcksTrustee(i + 1);
          }, 500);
        } else {
          console.log("Trustee #" + id + " did not acknowledge!");
        }
      }, 500);
    } else {
      console.log("SUCCESS!");
    }
  }

  checkAcksStart() {
    this.checkAcksPk = {
      g: this.helios_c.params.g,
      p: this.helios_c.params.p,
      q: this.helios_c.params.q,
    };
    this.checkAcksTrustee(0);
  }

  async getRandomness() {
    /**
     * async function to get the randomness
     * @returns {int} randomness
     */

    const resp = await fetch(
      backendOpIP + "/" + this.shortName + "/get-randomness",
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (resp.status === 200) {
      const jsonResponse = await resp.json();
      return jsonResponse.randomness;
    }
  }

  async sendStep(step, data) {
    /**
     * async function to send the step
     * @param {int} step to send
     * @param {object} data to send with info about step
     * @returns {object} data response
     */

    const url =
      backendOpIP +
      "/" +
      this.shortName +
      "/trustee/step-" +
      step;

    const resp = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    if (resp.status === 200) {
      this.trusteeStep = this.trusteeStep + 1;
      this.execute = false;
      this.setSteps(this.index, "Paso " + step + " completada");
      this.reactFunction('setProcessFeedback', "Paso " + step + " completada");
      this.setStepInit(this.trusteeStep);
    } else {
      this.reactFunction('setProcessFeedback', "Error al enviar la etapa " + step);
      this.setSteps(this.index, "Error al enviar la etapa " + step);
    }
  }

  async getDataStep(step) {
    /**
     * async function to get the data of the step
     * @param {int} step to get
     * @returns {object} data response
     */

    const url =
      backendOpIP +
      "/" +
      this.shortName +
      "/trustee/" +
      step;

    const resp = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const jsonResponse = await resp.json();
    return jsonResponse;
  }

  async getStep() {
    /**
     * async function to get the actual step for trustee
     * @returns {object} data response
     */
    const url =
      backendOpIP +
      "/" +
      this.shortName +
      "/trustee/get-step";

    const resp = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    const jsonResponse = await resp.json();
    return jsonResponse;
  }

  initProcess() {
    this.trusteeStep = this.trusteeCrypto.current_step;
    this.reactFunction("setEnabledButtonInit", false);
    this.totalProcess();
    this.interval = window.setInterval(() => {
      this.totalProcess();
    }, 5000);
  }

  totalProcess() {
    this.getStep().then((data) => {
      if (this.trusteeStep === data.status) {

        if (this.trusteeStep === trusteeStep.certificates_step && !this.execute) {
          this.reactFunction('setProcessFeedback', `Ejecutando el Paso 2.${this.trusteeStep}`);
          this.setSteps(this.index, `Ejecutando el Paso 2.${this.trusteeStep}`);
          this.execute = true;
          this.step_1();
        } else if (this.trusteeStep === trusteeStep.coefficients_step && !this.execute) {
          this.reactFunction('setProcessFeedback', "Ejecutando el Paso 2." + this.trusteeStep);
          this.setSteps(this.index, "Ejecutando el Paso 2." + this.trusteeStep);
          this.execute = true;
          this.step_2();
        } else if (this.trusteeStep === trusteeStep.points_step && !this.execute) {
          this.reactFunction('setProcessFeedback', "Ejecutando el Paso 2." + this.trusteeStep);
          this.setSteps(this.index, "Ejecutando el Paso 2." + this.trusteeStep);
          this.execute = true;
          this.step_3();
        } else if (this.trusteeStep === trusteeStep.waiting_decryptions) {
          this.reactFunction('setProcessFeedback', "Generación de claves completada con éxito");
          this.setSteps(this.index, "Generación de claves completada con éxito");
          window.clearInterval(this.interval);
        }
      } else {
        this.reactFunction('setProcessFeedback', "Los otros trustee aún no completan la etapa");
        this.setSteps(this.index, "Los otros trustee aún no completan la etapa");
      }
    });
  }

  step_0() {
    /**
     * Step 0: generate the secret key
     *
     */

    document.getElementById("process_step").style.display = "none";
    this.generateKeyPair();
    this.downloadSkToFile(
      "trustee_key_" +
        this.trustee.username +
        "_" +
        this.shortName +
        ".txt"
    );
    this.reactFunction("setSecretKey", this.helios_c.secret_key);
    this.setSteps(this.index, "Para continuar, debe subir el archivo recién descargado. Recuerde guardar adecuadamente el archivo en su computador y respaldarlo.");
    this.reactFunction(
      "setProcessFeedback",
      "Para continuar, debe subir el archivo recién descargado. Recuerde guardar adecuadamente el archivo en su computador y respaldarlo."
    );
  }

  step_1() {
    /**
     * Step 1: generate the certificate
     */
    getEgParams(this.shortName).then((params) => {
      this.getDataStep("step-1").then((data_step) => {
        if ("error" in data_step) {
          this.execute = false;
          this.reactFunction('setProcessFeedback', data_step["error"]);
          return;
        }

        this.getRandomness().then((data_randomnes) => {
          const randomness = data_randomnes;
          sjcl.random.addEntropy(randomness);
          const trusteeCryptoAux = this.trusteeCrypto;
          const self = this;
          BigInt.setup(function () {
            self.helios_c.params = ElGamal.Params.fromJSONObject(JSON.parse(params));
            self.helios_c.params.trustee_id = trusteeCryptoAux.trustee_election_id;
            self.helios_c.certificates = JSON.parse(data_step.certificates);
          });

          this.helios_c.ui_validator_start();
          const loadKey = this.helios_c.ui_load_secret_key(this.helios_c.secret_key);
          this.helios_c.trustee = loadKey.trustee;
          this.helios_c.secret_key = loadKey.key;
          this.derivatorStart();
        });
      });
    });
  }

  step_2() {
    /**
     * Step 2: generate the coefficients
     */
    getEgParams(this.shortName).then((params) => {
      this.getDataStep("step-2").then((data_step) => {
        if ("error" in data_step) {
          this.execute = false;
          this.reactFunction('setProcessFeedback', data_step["error"]);
          return;
        }
        // get some more server-side randomness for keygen
        this.getRandomness().then((data_randomnes) => {
          const randomness = data_randomnes;
          sjcl.random.addEntropy(randomness);
          let trusteeCryptoAux = this.trusteeCrypto;
          let coefficentsAux = this.coefficents;
          const self = this;
          BigInt.setup(function () {
            self.helios_c.params = ElGamal.Params.fromJSONObject(JSON.parse(params));
            self.helios_c.params.trustee_id = trusteeCryptoAux.trustee_election_id;
            self.helios_c.certificates = JSON.parse(data_step.certificates);
            coefficentsAux = JSON.parse(data_step.coefficients);
            self.helios_c.points = JSON.parse(data_step.points);
          });
          this.coefficents = coefficentsAux;
          this.helios_c.ui_validator_start();
          const loadKey = this.helios_c.ui_load_secret_key(this.helios_c.secret_key);
          this.helios_c.trustee = loadKey.trustee;
          this.helios_c.secret_key = loadKey.key;
          this.acknowledgerStart();
        });
      });
    });
  }

  step_3() {
    /**
     * Step 3: generate the points
     */
    getEgParams(this.shortName).then((params) => {
      this.getDataStep("step-3").then((data_step) => {
        if ("error" in data_step) {
          this.execute = false;
          this.reactFunction('setProcessFeedback', data_step["error"]);
          return;
        }
        // get some more server-side randomness for keygen
        this.getRandomness().then((data_randomnes) => {
          const randomness = data_randomnes;
          sjcl.random.addEntropy(randomness);
          let coefficentsAux = this.coefficents;
          let sentAux = this.sent;
          let ack2Aux = this.ack2;
          let trusteeCryptoAux = this.trusteeCrypto;
          const self = this;
          BigInt.setup(function () {
            self.helios_c.params = ElGamal.Params.fromJSONObject(JSON.parse(params));
            self.helios_c.params.trustee_id = trusteeCryptoAux.trustee_election_id;
            self.helios_c.certificates = JSON.parse(data_step.certificates);
            coefficentsAux = JSON.parse(data_step.coefficents);
            self.helios_c.points = JSON.parse(data_step.points);
            sentAux = JSON.parse(data_step.points_sent);
            ack2Aux = JSON.parse(data_step.acks);
          });
          this.coefficents = coefficentsAux;
          this.sent = sentAux;
          this.ack2 = ack2Aux;
          this.helios_c.ui_validator_start();

          const loadKey = this.helios_c.ui_load_secret_key(this.helios_c.secret_key);

          this.helios_c.trustee = loadKey.trustee;
          this.helios_c.secret_key = loadKey.key;
          this.checkAcksStart();

          this.helios_c.ui_share_start(this);
        });
      });
    });
  }

  getSecretKey() {
    return this.helios_c.secret_key;
  }

  generateKeyPair() {
    try {
      this.helios_c.trustee = this.helios_c.trustee_create(this.elGamalParams);
      this.setupPublicKeyAndProf();
      return true;
    } catch (e) {
      alert(e);
      return false;
    }
  }

  setupPublicKeyAndProf() {
    this.certificate = this.helios_c.trustee.generate_certificate();
    this.certificateCache = this.certificate;
    this.helios_c.secret_key = this.helios_c.trustee.get_secret_key();
    //this.storage.setItem('key', SECRET_KEY);
  }

  downloadSkToFile(filename) {
    var element = document.createElement("a");
    const fileContent = {
      trustee: this.trustee.name,
      private_key: this.helios_c.secret_key,
    };
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + JSON.stringify(fileContent)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  async sendPublicKey() {
    const url = `${backendOpIP}/${this.shortName}/trustee/upload-pk`;

    const resp = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_key_json: JSON.stringify(this.certificateCache),
      }),
    });

    if (resp.status === 200) {
      this.trusteeStep = trusteeStep.certificates_step;
      this.trusteeCrypto.current_step = trusteeStep.certificates_step;
      this.reactFunction("setActualStep", 1);
      this.reactFunction("setActualPhase", 2);
      this.execute = false;
      this.setStepInit(this.trusteeStep);
    }
  }

  setStepInit(step) {
    this.reactFunction("setActualStep", step);
    if (step === trusteeStep.waiting_decryptions) {
      this.reactFunction("setActualPhase", 3);
      this.reactFunction("setEnabledButtonInit", false);
      this.setSteps(this.index, "¡Sincronización terminada!");
      this.reactFunction("setProcessFeedback", "¡Sincronización terminada!");
    } else if (step < 4) {
      if (step !== 0) {
        this.reactFunction("setActualPhase", 2);
        this.reactFunction(
          "setProcessFeedback",
          "Esperando que se complete el proceso"
        );
        //setTextButtonInit("Continuar proceso");
      } else {
        this.reactFunction("setActualPhase", 1);
        this.reactFunction(
          "setProcessFeedback",
          "Clave Privada aún no generada"
        );
      }
    }
  }

  prepareUpload() {
    var pk = {
      g: this.helios_c.params.g.toString(),
      p: this.helios_c.params.p.toString(),
      q: this.helios_c.params.q.toString(),
      y: this.helios_c.params.g.modPow(this.helios_c.sum, this.helios_c.params.p).toString(),
    };
    const verification_key = JSON.stringify(pk);
    this.sendStep(
      3,
      JSON.stringify({
        verification_key: verification_key,
      })
    );
  }

  downloadKey() {
    this.downloadSkToFile(
      "trustee_key_" +
        this.trustee.trustee_login_id +
        "_" +
        this.shortName +
        ".txt"
    );
  }

  checkSk(key) {
    this.helios_c.secret_key = key;
    if (key === this.helios_c.secret_key) {
      if(this.trusteeCrypto.current_step === trusteeStep.secret_key_step) this.sendPublicKey();
      this.initProcess();
    } else {
      this.reactFunction('setProcessFeedback', "Archivo incorrecto, inténtelo nuevamente");
    }
  }
}
