const OctoPrintRoutes = require("../../server/services/octoprint/octoprint-api.routes");
const { processResponse } = require("../../server/services/octoprint/utils/api.utils");

class OctoPrintApiMock extends OctoPrintRoutes {
  #storedResponse;
  #storedStatusCode;

  #eventEmitter2;
  #logger;

  constructor({ settingsStore, httpClient, loggerFactory, eventEmitter2 }) {
    super({ settingsStore });
    this.#eventEmitter2 = eventEmitter2;
    this.#logger = loggerFactory("OctoPrint-API-Service", false);
  }

  storeResponse(storedResponse, storedStatusCode) {
    this.#storedResponse = storedResponse;
    this.#storedStatusCode = storedStatusCode;
  }

  async #handleResponse(url, options) {
    // Validate url
    new URL(url);

    // Return mock
    return Promise.resolve({ data: this.#storedResponse, status: this.#storedStatusCode });
  }

  async getFiles(printer, recursive = false, responseOptions) {
    const { url, options } = this._prepareRequest(printer, this.apiGetFiles(recursive));
    const response = await this.#handleResponse(url, options);
    return processResponse(response, responseOptions);
  }

  async getFile(printer, path, responseOptions) {
    const { url, options } = this._prepareRequest(printer, this.apiFile(path));
    const response = await this.#handleResponse(url, options);
    return processResponse(response, responseOptions);
  }
}

module.exports = OctoPrintApiMock;
