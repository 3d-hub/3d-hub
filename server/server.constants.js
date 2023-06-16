const AppConstants = {
  NON_NPM_MODE_KEY: "NON_NPM_MODE",
  NODE_ENV_KEY: "NODE_ENV",
  VERSION_KEY: "npm_package_version",
  SERVER_PORT_KEY: "SERVER_PORT",
  MONGO_KEY: "MONGO",

  pm2ServiceName: "FDM",
  logAppName: "fdm-monster",

  // @Deprecated: old storage path
  defaultFileStorageFolder: "./media",
  // New place for all downloads, files etc
  defaultClientBundleStorage: "./media/client-dist",
  defaultClientBundleZipsStorage: "./media/client-dist-zips",
  defaultServerPort: 4000,
  defaultMongoStringUnauthenticated: "mongodb://127.0.0.1:27017/fdm-monster",
  apiRoute: "/api",
  enableClientDistAutoUpdateKey: "ENABLE_CLIENT_DIST_AUTO_UPDATE",

  defaultTestEnv: "test",
  defaultProductionEnv: "production",
  knownEnvNames: ["development", "production", "test"],
  GITHUB_PAT: "GITHUB_PAT",
  clientPackageName: "@fdm-monster/client",
  clientRepoName: "fdm-monster-client",
  serverRepoName: "fdm-monster",
  orgName: "fdm-monster",
  defaultClientMinimum: "1.2.0-rc6",
  serverPath: "./",

  influxUrl: "INFLUX_URL",
  influxToken: "INFLUX_TOKEN",
  influxOrg: "INFLUX_ORG",
  influxBucket: "INFLUX_BUCKET",

  // Websocket values
  defaultWebsocketHandshakeTimeout: 2000,
  defaultSocketThrottleRate: 1,
  debugSocketStatesKey: "DEBUG_SOCKET_STATES",
  defaultDebugSocketStates: "false",

  // Future experimental feature
  enableMqttAutoDiscoveryToken: "ENABLE_MQTT_AUTODISCOVERY",
  enableMqttAutoDiscoveryDefault: "false",
  mqttUrlToken: "MQTT_HOST",
  mqttPortToken: "MQTT_PORT",
  mqttPortDefault: 1883,
  mqttUsernameToken: "MQTT_USERNAME",
  mqttPasswordToken: "MQTT_PASSWORD",

  // Sentry
  sentryCustomDsnToken: "SENTRY_CUSTOM_DSN",
  sentryCustomDsnDefault: "https://164b8028a8a745bba3dbcab991b84ae7@o4503975545733120.ingest.sentry.io/4505101598261248",
};

module.exports = {
  AppConstants,
};
