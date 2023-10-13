import { createController } from "awilix-express";
import { authenticate, authorizeRoles } from "@/middleware/authenticate";
import { AppConstants } from "@/server.constants";
import { ROLES } from "@/constants/authorization.constants";
import { validateInput } from "@/handlers/validators";
import { sentryDiagnosticsEnabledRules, whitelistSettingUpdateRules } from "@/services/validators/settings-service.validation";
import { SettingsStore } from "@/state/settings.store";
import { Request, Response } from "express";
import { address } from "ip";
import { version } from "@/../package.json";
import { IpWhitelistSettingsDto } from "@/services/interfaces/settings.dto";
import { ILoggerFactory } from "@/handlers/logger-factory";
import { LoggerService } from "@/handlers/logger";

export class SettingsController {
  settingsStore: SettingsStore;
  logger: LoggerService;

  constructor({ settingsStore, loggerFactory }: { settingsStore: SettingsStore; loggerFactory: ILoggerFactory }) {
    this.settingsStore = settingsStore;
    this.logger = loggerFactory(SettingsController.name);
  }

  getSettings(req: Request, res: Response) {
    // Safely get IP address
    let connection;
    try {
      const serverIp = address();
      connection = {
        clientIp: req.socket?.remoteAddress,
        ip: serverIp,
        version,
      };
    } catch (e) {
      this.logger.warn("Could not fetch server IP address");
    }
    const settings = this.settingsStore.getSettings();
    res.send({ ...settings, connection });
  }

  async getSettingsSensitive(req: Request, res: Response) {
    const settings = this.settingsStore.getSettingsSensitive();
    res.send(settings);
  }

  async updateSentryDiagnosticsEnabled(req: Request, res: Response) {
    const { enabled } = await validateInput(req.body, sentryDiagnosticsEnabledRules);
    const result = this.settingsStore.setSentryDiagnosticsEnabled(enabled);
    res.send(result);
  }

  async updateWhitelistSettings(req: Request, res: Response) {
    const { whitelistEnabled, whitelistedIpAddresses } = await validateInput<IpWhitelistSettingsDto>(
      req.body,
      whitelistSettingUpdateRules
    );
    if (!whitelistedIpAddresses.includes("127.0.0.1")) {
      whitelistedIpAddresses.push("127.0.0.1");
    }
    const result = await this.settingsStore.setWhitelist(whitelistEnabled, whitelistedIpAddresses);
    res.send(result);
  }

  async updateFrontendSettings(req: Request, res: Response) {
    const result = await this.settingsStore.updateFrontendSettings(req.body);
    res.send(result);
  }

  async updateServerSettings(req: Request, res: Response) {
    const result = await this.settingsStore.updateServerSettings(req.body);
    res.send(result);
  }

  async updateFileCleanSettings(req: Request, res: Response) {
    const result = await this.settingsStore.patchFileCleanSettings(req.body);
    res.send(result);
  }

  async updateTimeoutSettings(req: Request, res: Response) {
    const result = await this.settingsStore.updateTimeoutSettings(req.body);
    res.send(result);
  }
}

// prettier-ignore
export default createController(SettingsController)
    .prefix(AppConstants.apiRoute + "/settings")
    .before([authenticate()])
    .get("/", "getSettings")
    .get("/sensitive", "getSettingsSensitive", { before: [authorizeRoles([ROLES.ADMIN])] })
    .patch("/sentry-diagnostics", "updateSentryDiagnosticsEnabled")
    .put("/server", "updateServerSettings", { before: [authorizeRoles([ROLES.ADMIN])] })
    .put("/file-clean", "updateFileCleanSettings", { before: [authorizeRoles([ROLES.ADMIN])] })
    .put("/whitelist", "updateWhitelistSettings", { before: [authorizeRoles([ROLES.ADMIN])] })
    .put("/frontend", "updateFrontendSettings", { before: [authorizeRoles([ROLES.ADMIN])] })
    .put("/timeout", "updateTimeoutSettings", { before: [authorizeRoles([ROLES.ADMIN])] });
