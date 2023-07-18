const { AppConstants } = require("../server.constants");
const { generateCorrelationToken } = require("../utils/correlation-token.util");

const getDefaultWhitelistIpAddresses = () => ["::12", "127.0.0.1"];

const serverSettingsKey = "server";
const getDefaultServerSettings = () => ({
  debugSettings: {
    debugSocketIoEvents: false,
    debugSocketReconnect: false,
    debugSocketRetries: false,
    debugSocketSetup: false,
    debugSocketMessages: false,
    debugSocketIoBandwidth: false,
  },
  registration: true,
  whitelistEnabled: false,
  whitelistedIpAddresses: getDefaultWhitelistIpAddresses(),
  loginRequired: false,
});

const credentialSettingsKey = "credentials";

const getDefaultCredentialSettings = () => ({
  // Verification and signing of JWT tokens, can be changed on the fly
  jwtSecret: generateCorrelationToken(),
  // Signing only, verification is automatic
  jwtExpiresIn: AppConstants.DEFAULT_JWT_EXPIRES_IN,
  // Verification only, bringing into effect requires updating all stored refresh tokens
  refreshTokenAttempts: AppConstants.DEFAULT_REFRESH_TOKEN_ATTEMPTS,
  // Verification only, bringing into effect requires updating all stored refresh tokens
  refreshTokenExpiry: AppConstants.DEFAULT_REFRESH_TOKEN_EXPIRY,
});

const frontendSettingKey = "frontend";
const getDefaultFrontendSettings = () => ({
  gridCols: 8,
  gridRows: 8,
  largeTiles: false,
});

const timeoutSettingKey = "timeout";
const getDefaultTimeout = () => ({
  apiTimeout: 1000,
});

const fileCleanSettingKey = "printerFileClean";
const getDefaultFileCleanSettings = () => ({
  autoRemoveOldFilesBeforeUpload: false,
  autoRemoveOldFilesAtBoot: false,
  autoRemoveOldFilesCriteriumDays: 7,
});

const getDefaultSettings = () => ({
  [credentialSettingsKey]: getDefaultCredentialSettings(),
  [serverSettingsKey]: getDefaultServerSettings(),
  [fileCleanSettingKey]: getDefaultFileCleanSettings(),
  [frontendSettingKey]: getDefaultFrontendSettings(),
  [timeoutSettingKey]: getDefaultTimeout(),
});

module.exports = {
  serverSettingsKey,
  getDefaultServerSettings,
  timeoutSettingKey,
  getDefaultTimeout,
  frontendSettingKey,
  getDefaultFrontendSettings,
  getDefaultWhitelistIpAddresses,
  credentialSettingsKey,
  getDefaultCredentialSettings,
  fileCleanSettingKey,
  getDefaultFileCleanSettings,
  getDefaultSettings,
};
