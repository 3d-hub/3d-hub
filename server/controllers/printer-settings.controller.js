const { authenticate, withPermission } = require("../middleware/authenticate");
const { createController } = require("awilix-express");
const { validateInput } = require("../handlers/validators");
const { AppConstants } = require("../server.constants");
const { idRules } = require("./validation/generic.validation");
const { setGcodeAnalysis } = require("./validation/printer-settings-controller.validation");
const { PERMS } = require("../constants/authorization.constants");

class PrinterSettingsController {
  /**
   * @type {PrinterCache}
   */
  printerCache;
  #octoPrintApiService;

  #logger;

  constructor({ printerCache, loggerFactory, octoPrintApiService }) {
    this.#logger = loggerFactory(PrinterSettingsController.name);
    this.printerCache = printerCache;
    this.#octoPrintApiService = octoPrintApiService;
  }

  /**
   * Previous printerInfo action (not a list function)
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async get(req, res) {
    const { id: printerId } = await validateInput(req.params, idRules);

    const printerLogin = this.printerCache.getLoginDto(printerId);
    const settings = await this.#octoPrintApiService.getSettings(printerLogin);
    res.send(settings);
  }

  async setGCodeAnalysis(req, res) {
    const { id: printerId } = await validateInput(req.params, idRules);
    const input = await validateInput(req.body, setGcodeAnalysis);

    const printerLogin = this.printerCache.getLoginDto(printerId);
    const settings = await this.#octoPrintApiService.setGCodeAnalysis(printerLogin, input);
    res.send(settings);
  }

  async syncPrinterName(req, res) {
    const { id: printerId } = await validateInput(req.params, idRules);

    const printerLogin = this.printerCache.getLoginDto(printerId);
    const printerName = this.printerCache.getName(printerId);
    const settings = await this.#octoPrintApiService.updatePrinterNameSetting(
      printerLogin,
      printerName,
    );
    res.send(settings);
  }
}

// prettier-ignore
module.exports = createController(PrinterSettingsController)
  .prefix(AppConstants.apiRoute + "/printer-settings")
  .before([authenticate()])
  .get("/:id", "get", withPermission(PERMS.PrinterSettings.Get))
  .post("/:id/gcode-analysis", "setGCodeAnalysis")
  .post("/:id/sync-printername", "syncPrinterName");
