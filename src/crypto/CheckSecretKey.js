import { ElGamal } from "../static/booth/js/jscrypto/elgamal";
import { helios_c } from "../static/booth/js/jscrypto/heliosc-trustee";
import { getCheckSk, getEgParams } from "../services/crypto";

import Crypto from "./Crypto";

export default class CheckSecretKey extends Crypto {
  constructor(shortName, uuidTrustee, { reactFunctions } = {}) {
    super({ reactFunctions });
    this.shortName = shortName;
    this.uuidTrustee = uuidTrustee;
    this.certificates = [];
    this.elGamalParams = {};
  }

  initParams() {
    getCheckSk(this.shortName).then((data) => {
      this.certificates = data;
    });
    getEgParams(this.shortName).then((data) => {
      this.elGamalParams = JSON.parse(data);
    });
  }

  checkSk(sk) {
    if (!sk) {
      this.reactFunction('setFeedbackMessage', "Archivo de formato incorrecto.");
      return "Archivo de formato incorrecto."
    }
    let params = ElGamal.Params.fromJSONObject(this.elGamalParams);
    let trustee_aux = helios_c.trustee_create(params, sk);
    let key_ok_p = false;
    if (!trustee_aux.check_certificate(this.certificates)) {
      console.log("Not the right key!");
    } else {
      console.log("The right key!");
      key_ok_p = true;
    }
    if (key_ok_p) {
      this.reactFunction('setFeedbackMessage', "Clave verificada exitosamente ✔");
      return "Clave verificada exitosamente ✔"
    } else {
      this.reactFunction('setFeedbackMessage', "Tu clave privada está incorrecta.");
      return "Tu clave privada está incorrecta."
    }
  }
}
