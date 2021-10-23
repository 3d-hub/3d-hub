const { createController } = require("awilix-express");
const { AppConstants } = require("../server.constants");
const { ensureAuthenticated } = require("../middleware/auth");
const { printerResolveMiddleware } = require("../middleware/printer");
const { getScopedPrinter } = require("../handlers/validators");
const Profiles = require("../models/Profiles.js");
const _ = require("lodash");

class PrinterProfilesController {
  #printerProfilesCache;
  #octoPrintApiService;
  #settingsStore;

  constructor({ settingsStore, printerProfilesCache, octoPrintApiService }) {
    this.#settingsStore = settingsStore;
    this.#printerProfilesCache = printerProfilesCache;
    this.#octoPrintApiService = octoPrintApiService;
  }

  async listProfiles(req, res) {
    const { printerLogin } = getScopedPrinter(req);
    const profiles = await this.#octoPrintApiService.listProfiles(printerLogin);
    res.send({ profiles });
  }

  async listProfilesCache(req, res) {
    const { currentPrinterId } = getScopedPrinter(req);
    const profiles = await this.#printerProfilesCache.getPrinterProfiles(currentPrinterId);
    res.send({ profiles });
  }

  async createProfile(req, res) {
    const { filamentManager } = this.#settingsStore.getServerSettings();

    const newProfile = req.body;
    const error = [];
    this.#logger.info("Saving Filament Manager Profile: ", newProfile);
    const filamentManagerID = null;
    if (filamentManager) {
      const printerList = Runner.returnFarmPrinters();
      let printer = null;
      for (let i = 0; i < 10; i++) {
        if (
          printerList[i].stateColour.category === "Disconnected" ||
          printerList[i].stateColour.category === "Idle" ||
          printerList[i].stateColour.category === "Active" ||
          printerList[i].stateColour.category === "Complete"
        ) {
          printer = printerList[i];
          break;
        }
      }
      const profile = {
        vendor: newProfile.manufacturer,
        material: newProfile.material,
        density: newProfile.density,
        diameter: newProfile.diameter
      };
      this.#logger.info("Updating OctoPrint: ", profile);

      // TODO move to client service
      const url = `${printer.printerURL}/plugin/filamentmanager/profiles`;
      let updateFilamentManager = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": printer.apiKey
        },
        body: JSON.stringify({ profile })
      });
      updateFilamentManager = await updateFilamentManager.json();
      const reSync = await this.#filamentManagerPluginService.filamentManagerReSync("AddSpool");

      res.send({
        res: "success",
        dataProfile: reSync.newProfiles,
        filamentManager
      });
    } else {
      const profile = {
        index: filamentManagerID,
        manufacturer: newProfile.manufacturer,
        material: newProfile.material,
        density: newProfile.density,
        diameter: newProfile.diameter
      };
      const dataProfile = new Profiles({
        profile
      });

      dataProfile
        .save()
        .then(async (e) => {
          this.#logger.info("New profile saved to database, running filament cleaner", e);
          FilamentClean.start(filamentManager);
          res.send({ res: error, dataProfile, filamentManager });
        })
        .catch((e) => this.#logger.error(e));
    }
  }

  async updateProfile(req, res) {
    const { filamentManager } = this.#settingsStore.getServerSettings();

    let searchId = req.body.id;
    const newContent = req.body.profile;
    this.#logger.info("Profile Edit Request: ", newContent);

    if (filamentManager) {
      const printerList = Runner.returnFarmPrinters();
      let printer = null;
      for (let i = 0; i < printerList.length; i++) {
        if (
          printerList[i].stateColour.category === "Disconnected" ||
          printerList[i].stateColour.category === "Idle" ||
          printerList[i].stateColour.category === "Active" ||
          printerList[i].stateColour.category === "Complete"
        ) {
          printer = printerList[i];
          break;
        }
      }
      const profile = {
        vendor: newContent[0],
        material: newContent[1],
        density: newContent[2],
        diameter: newContent[3]
      };

      this.#logger.info("Updating OctoPrint: ", profile);
      // TODO move to client service
      const url = `${printer.printerURL}/plugin/filamentmanager/profiles/${searchId}`;
      let updateFilamentManager = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": printer.apiKey
        },
        body: JSON.stringify({ profile })
      });

      updateFilamentManager = await updateFilamentManager.json();
      this.#logger.info("New spool created on plugin: ", updateFilamentManager.profile.id);
      filamentManagerID = updateFilamentManager.profile.id;
      const profiles = await Profiles.find({});
      const findID = _.findIndex(profiles, function (o) {
        return o.profile.index == searchId;
      });
      searchId = profiles[findID]._id;
    }
    const profile = await Profiles.findById(searchId);
    if (profile.profile.manufacturer != newContent[0]) {
      profile.profile.manufacturer = newContent[0];
      profile.markModified("profile");
    }
    if (profile.profile.material != newContent[1]) {
      profile.profile.material = newContent[1];
      profile.markModified("profile");
    }
    if (profile.profile.density != newContent[2]) {
      profile.profile.density = newContent[2];
      profile.markModified("profile");
    }
    if (profile.profile.diameter != newContent[3]) {
      profile.profile.diameter = newContent[3];
      profile.markModified("profile");
    }
    await profile.save();
    this.#logger.info("Profile saved successfully");
    FilamentClean.start(filamentManager);
    Profiles.find({}).then((profiles) => {
      Runner.updateFilament();
      res.send({ profiles });
    });
  }

  async deleteProfile(req, res) {
    const { filamentManager } = this.#settingsStore.getServerSettings();

    const searchId = req.body.id;
    this.#logger.info("Profile delete request: ", searchId);
    if (filamentManager) {
      const printerList = Runner.returnFarmPrinters();
      let printer = null;
      for (let i = 0; i < printerList.length; i++) {
        if (
          printerList[i].stateColour.category === "Disconnected" ||
          printerList[i].stateColour.category === "Idle" ||
          printerList[i].stateColour.category === "Active" ||
          printerList[i].stateColour.category === "Complete"
        ) {
          printer = printerList[i];
          break;
        }
      }
      this.#logger.info("Updating OctoPrint: ", searchId);
      // TODO move to client service
      const url = `${printer.printerURL}/plugin/filamentmanager/profiles/${searchId}`;
      const updateFilamentManager = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": printer.apiKey
        }
      });
      const profiles = await Profiles.find({});
      const findID = _.findIndex(profiles, function (o) {
        return o.profile.index == searchId;
      });
      this.#logger.info("Deleting from database: ", searchId);
      const rel = await Profiles.deleteOne({ _id: profiles[findID]._id }).exec();
      this.#logger.info("Profile deleted successfully");
      FilamentClean.start(filamentManager);
      rel.status = 200;
      res.send({ profiles });
    } else {
      this.#logger.info("Deleting from database: ", searchId);
      const rel = await Profiles.deleteOne({ _id: searchId }).exec();
      rel.status = 200;
      this.#logger.info("Profile deleted successfully");
      FilamentClean.start(filamentManager);
      Profiles.find({}).then((profiles) => {
        res.send({ profiles });
      });
    }
  }
}

module.exports = createController(PrinterProfilesController)
  .prefix(AppConstants.apiRoute + "/printer-profiles")
  .before([ensureAuthenticated, printerResolveMiddleware()])
  .get("/:id/cache", "listCache")
  .get("/:id", "get")
  .post("/:id", "create")
  .patch("/:id", "update")
  .delete("/:id", "delete");
