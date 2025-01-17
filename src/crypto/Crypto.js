export default class Crypto {
  constructor({ reactFunctions } = {}) {
    this.reactFunctions = reactFunctions ? reactFunctions : {};
  }

  reactFunction(functionName, params) {
    if (functionName in this.reactFunctions) {
      this.reactFunctions[functionName](params);
    }
  }
}
