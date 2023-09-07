const { createController } = require("awilix-express");
const { AppConstants } = require("../server.constants");
const { isNodemon, isNode, isPm2 } = require("../utils/env.utils");
const { authenticate, withPermission, authorizePermission } = require("../middleware/authenticate");
const { PERMS, ROLES } = require("../constants/authorization.constants");
const { isDocker } = require("../utils/is-docker");
const { serverSettingsKey } = require("../constants/server-settings.constants");
const { BadRequestException, AuthorizationError } = require("../exceptions/runtime.exceptions");
const { validateMiddleware } = require("../handlers/validators");
const { wizardSettingsRules } = require("./validation/setting.validation");

class ServerPublicController {
  /**
   * @type {string}
   */
  serverVersion;
  /**
   * @type {SettingsStore}
   */
  settingsStore;
  /**
   * @type {PrinterSocketStore}
   */
  printerSocketStore;
  /**
   * @type {ServerReleaseService}
   */
  serverReleaseService;
  /**
   * @type {MonsterPiService}
   */
  monsterPiService;
  /**
   * @type {UserService}
   */
  userService;
  /**
   * @type {RoleService}
   */
  roleService;

  constructor({
    settingsStore,
    printerSocketStore,
    serverVersion,
    serverReleaseService,
    monsterPiService,
    userService,
    roleService,
  }) {
    this.settingsStore = settingsStore;
    this.serverVersion = serverVersion;
    this.printerSocketStore = printerSocketStore;
    this.serverReleaseService = serverReleaseService;
    this.monsterPiService = monsterPiService;
    this.userService = userService;
    this.roleService = roleService;
  }

  welcome(req, res) {
    const serverSettings = this.settingsStore.getSettings();

    if (serverSettings[serverSettingsKey].loginRequired === false) {
      return res.send({
        message: "Login disabled. Please load the Vue app.",
      });
    }

    return res.send({
      message: "Login successful. Please load the Vue app.",
    });
  }

  async completeWizard(req, res) {
    if (this.settingsStore.isWizardCompleted()) {
      throw new AuthorizationError("Wizard already completed");
    }

    // TODO deal with loginRequired and admin user env vars when wizard is completed
    const { loginRequired, registration, rootUsername, rootPassword } = await validateMiddleware(req, wizardSettingsRules);
    const role = await this.roleService.getSynchronizedRoleByName(ROLES.ADMIN);

    const user = await this.userService.findRawByUsername(rootUsername?.toLowerCase());
    if (!!user) {
      throw new BadRequestException("This user already exists");
    }

    await this.userService.register({
      username: rootUsername,
      password: rootPassword,
      roles: [role.id],
    });
    await this.settingsStore.setLoginRequired(loginRequired);
    await this.settingsStore.setRegistrationEnabled(registration);
    await this.settingsStore.setWizardCompleted(AppConstants.currentWizardVersion);

    return res.send();
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
      logDumpZip: {
        available: true,
        version: 1,
      },
      clearLogFiles: {
        available: true,
        version: 1,
      },
      batchTogglePrinterEnabled: {
        available: true,
        version: 1,
      },
      cameraStream: {
        available: true,
        version: 1,
        subFeatures: {},
      },
    });
  }

  async getVersion(req, res) {
    let updateState = this.serverReleaseService.getState();
    const monsterPiVersion = this.monsterPiService.getMonsterPiVersionSafe();

    res.json({
      version: this.serverVersion,
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
    .post("complete-wizard", "completeWizard")
    .get("", "welcome", { before: [authenticate(), authorizePermission(PERMS.ServerInfo.Get)] })
    .get("features", "getFeatures", { before: [authenticate(), authorizePermission(PERMS.ServerInfo.Get)] })
    .get("version", "getVersion", { before: [authenticate(), authorizePermission(PERMS.ServerInfo.Get)] });
