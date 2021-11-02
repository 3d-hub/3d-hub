const DITokens = {
  // Values
  defaultRole: "defaultRole",
  // Instances
  serverHost: "serverHost",
  loggerFactory: "loggerFactory",
  httpClient: "httpClient",
  multerService: "multerService",
  taskManagerService: "taskManagerService",
  toadScheduler: "toadScheduler",
  eventEmitter2: "eventEmitter2",
  printerService: "printerService",
  printerGroupService: "printerGroupService",
  serverSettingsService: "serverSettingsService",
  serverUpdateService: "serverUpdateService",
  clientSettingsService: "clientSettingsService",
  githubApiService: "githubApiService",
  userTokenService: "userTokenService",
  userService: "userService",
  permissionService: "permissionService",
  roleService: "roleService",
  octoPrintApiService: "octoPrintApiService",
  influxDbSetupService: "influxDbSetupService",
  influxDbFilamentService: "influxDbFilamentService",
  influxDbHistoryService: "influxDbHistoryService",
  influxDbPrinterStateService: "InfluxDbPrinterStateService",
  systemInfoBundleService: "systemInfoBundleService",
  printerFilesService: "printerFilesService",
  alertService: "alertService",
  scriptService: "scriptService",
  customGCodeService: "customGCodeService",
  autoDiscoveryService: "autoDiscoveryService",
  historyService: "historyService",
  // Stores/states
  settingsStore: "settingsStore",
  printersStore: "printersStore",
  printerTickerStore: "printerTickerStore",
  systemInfoStore: "systemInfoStore",
  filesStore: "filesStore",
  filamentStore: "filamentStore",
  printerStateFactory: "printerStateFactory",
  printerState: "printerState",
  // Caches
  printerGroupsCache: "printerGroupsCache",
  printerProfilesCache: "printerProfilesCache",
  terminalLogsCache: "terminalLogsCache",
  jobsCache: "jobsCache",
  dashboardStatisticsCache: "dashboardCache",
  fileCache: "fileCache",
  fileUploadTrackerCache: "fileUploadTrackerCache",
  historyCache: "historyCache",
  filamentCache: "filamentCache",
  // Tasks
  serverTasks: "serverTasks",
  bootTask: "bootTask",
  printerSystemTask: "printerSystemTask",
  softwareUpdateTask: "softwareUpdateTask",
  printerSseTask: "printerSseTask",
  printerSseHandler: "printerSseHandler",
  printerTestTask: "printerTestTask",
  systemCommandsService: "systemCommandsService",
  printerWebsocketTask: "printerWebsocketTask",
  printerWebsocketPingTask: "printerWebsocketPingTask"
};

module.exports = DITokens;
