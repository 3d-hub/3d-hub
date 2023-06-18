const { createController } = require("awilix-express");
const { AppConstants } = require("../server.constants");
const { isNodemon, isNode, isPm2 } = require("../utils/env.utils");
const { authenticate, withPermission } = require("../middleware/authenticate");
const { PERMS } = require("../constants/authorization.constants");
const { isDocker } = require("../utils/is-docker");
const { serverSettingsKey } = require("../constants/server-settings.constants");

class ServerPublicController {
  #serverVersion;
  #settingsStore;
  #printerSocketStore;
  #serverReleaseService;
  monsterPiService;

  constructor({ settingsStore, printerSocketStore, serverVersion, serverReleaseService, monsterPiService }) {
    this.#settingsStore = settingsStore;
    this.#serverVersion = serverVersion;
    this.#printerSocketStore = printerSocketStore;
    this.#serverReleaseService = serverReleaseService;
    this.monsterPiService = monsterPiService;
  }

  welcome(req, res) {
    const serverSettings = this.#settingsStore.getSettings();

    if (serverSettings[serverSettingsKey].loginRequired === false) {
      return res.send({
        message: "Login disabled. Please load the Vue app.",
      });
    }

    return res.send({
      message: "Login successful. Please load the Vue app.",
    });
  }

  getFeatures(req, res) {
    res.send({
      batchReprintCalls: {
        available: true,
        // API duplicated at /batch/reprint (deprecated but backwards compatible)
        version: 2,
      },
      batchConnectSocketCalls: {
        available: true,
        version: 1,
      },
      batchConnectUsbCalls: {
        available: true,
        version: 1,
      },
      newSockets: {
        available: true,
        version: 1,
      },
      anonymousDiagnosticsToggle: {
        available: true,
        version: 1,
      },
      pauseResumePrinterCommand: {
        available: true,
        version: 1,
      },
    });
  }

  async getVersion(req, res) {
    let updateState = this.#serverReleaseService.getState();
    const monsterPiVersion = this.monsterPiService.getMonsterPiVersionSafe();

    res.json({
      version: this.#serverVersion,
      isDockerContainer: isDocker(),
      isNodemon: isNodemon(),
      isNode: isNode(),
      isPm2: isPm2(),
      os: process.env.OS,
      monsterPi: monsterPiVersion,
      update: {
        synced: updateState.synced,
        updateAvailable: updateState.updateAvailable,
        includingPrerelease: updateState.includingPrerelease,
        airGapped: updateState.airGapped,
      },
    });
  }
}

// prettier-ignore
module.exports = createController(ServerPublicController)
  .prefix(AppConstants.apiRoute + "/")
  .before([authenticate()])
  .get("", "welcome")
  .get("features", "getFeatures")
  .get("version", "getVersion", withPermission(PERMS.ServerInfo.Get));
