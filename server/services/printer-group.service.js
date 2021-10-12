const PrinterGroupModel = require("../models/PrinterGroup");
const _ = require("lodash");
const { validateInput } = require("../handlers/validators");
const { createPrinterGroupRules } = require("./validators/printer-group-service.validators");

class PrinterGroupService {
  #printerService;
  #logger;

  constructor({ printerService, loggerFactory }) {
    this.#printerService = printerService;
    this.#logger = loggerFactory(PrinterGroupService.name);
  }

  /**
   * Stores a new printer group into the database.
   * @param {Object} printerGroup object to create.
   * @throws {Error} If the printer group is not correctly provided.
   */
  async create(printerGroup) {
    if (!printerGroup) throw new Error("Missing printer-group");

    const validatedInput = await validateInput(printerGroup, createPrinterGroupRules);

    return PrinterGroupModel.create(validatedInput);
  }

  /**
   * Updates the printerGroup present in the database.
   * @param {Object} printerGroup object to create.
   */
  async update(printerGroup) {
    return PrinterGroupModel.update(printerGroup);
  }

  /**
   * Lists the printer groups present in the database.
   */
  async list() {
    return PrinterGroupModel.find({});
  }

  async get(groupId) {
    return PrinterGroupModel.findOne({ _id: groupId });
  }

  async delete(groupId) {
    return PrinterGroupModel.deleteOne({ _id: groupId });
  }

  /**
   * Synchronize the old 'group' prop of each printer to become full-fledged PrinterGroup docs
   */
  async syncPrinterGroups() {
    const existingGroups = await this.list();
    const printers = (await this.#printerService.list()).filter((p) => !!p.group?.length);
    const printersGrouped = _.groupBy(printers, "group");

    // Early quit
    if (!printers || printers.length === 0) return [];

    // Detect groups which are not yet made
    for (const [groupName, printers] of Object.entries(printersGrouped)) {
      // Skip any printer with falsy group property
      if (typeof groupName !== "string" || !groupName) continue;

      // Check if group already exists by this name
      const printerIds = printers.map((p) => ({
        printerId: p._id,
        location: "?"
      }));
      const matchingGroup = existingGroups.find(
        (g) => g.name.toUpperCase() === groupName.toUpperCase()
      );
      if (!!matchingGroup) {
        matchingGroup.printers = printerIds;
        await PrinterGroupModel.update(matchingGroup);
      } else {
        await PrinterGroupModel.create({
          name: groupName,
          printers: printerIds
        });
      }
    }

    return PrinterGroupModel.find({});
  }
}

module.exports = PrinterGroupService;
