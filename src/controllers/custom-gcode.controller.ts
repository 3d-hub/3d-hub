import { createController } from "awilix-express";
import { authenticate, authorizeRoles } from "@/middleware/authenticate";
import { AppConstants } from "@/server.constants";
import { ROLES } from "@/constants/authorization.constants";
import { getScopedPrinter, validateInput } from "@/handlers/validators";
import { idRules } from "./validation/generic.validation";
import { printerResolveMiddleware } from "@/middleware/printer";
import { CustomGCodeService } from "@/services/custom-gcode.service";
import { OctoPrintApiService } from "@/services/octoprint/octoprint-api.service";
import { Request, Response } from "express";

export class CustomGCodeController {
  private octoPrintApiService: OctoPrintApiService;
  private customGCodeService: CustomGCodeService;

  constructor({
    customGCodeService,
    octoPrintApiService,
  }: {
    customGCodeService: CustomGCodeService;
    octoPrintApiService: OctoPrintApiService;
  }) {
    this.customGCodeService = customGCodeService;
    this.octoPrintApiService = octoPrintApiService;
  }

  async list(req: Request, res: Response) {
    const entities = await this.customGCodeService.list();
    res.send(entities);
  }

  async get(req: Request, res: Response) {
    const { id } = await validateInput(req.params, idRules);
    const entity = await this.customGCodeService.get(id);
    res.send(entity);
  }

  /**
   * Sends gcode according to https://docs.octoprint.org/en/master/api/printer.html#send-an-arbitrary-command-to-the-printer
   */
  async sendEmergencyM112(req: Request, res: Response) {
    const { printerLogin } = getScopedPrinter(req);
    const response = await this.octoPrintApiService.sendCustomGCodeCommand(printerLogin, "M112");
    res.send(response);
  }

  async create(req: Request, res: Response) {
    const createdScript = await this.customGCodeService.create(req.body);
    res.send(createdScript);
  }

  async delete(req: Request, res: Response) {
    const { id } = await validateInput(req.params, idRules);
    await this.customGCodeService.delete(id);
    res.send();
  }

  async update(req: Request, res: Response) {
    const { id } = await validateInput(req.params, idRules);
    const updatedScript = await this.customGCodeService.update(id, req.body);
    res.send(updatedScript);
  }
}

export default createController(CustomGCodeController)
  .prefix(`${AppConstants.apiRoute}/custom-gcode`)
  .before([authenticate(), authorizeRoles([ROLES.ADMIN, ROLES.OPERATOR])])
  .get("/", "list")
  .get("/:id", "get")
  .post("/", "create")
  .post("/send-emergency-m112/:printerId", "sendEmergencyM112", { before: [printerResolveMiddleware("printerId")] })
  .delete("/:id", "delete")
  .put("/:id", "update");
