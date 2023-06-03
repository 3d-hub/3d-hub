const {
  jsonContentType,
  contentTypeHeaderKey,
  apiKeyHeaderKey,
  OPClientErrors,
} = require("../constants/octoprint-service.constants");
const { ValidationException } = require("../../../exceptions/runtime.exceptions");

/**
 *
 * @param {LoginDto} login
 * @returns {{apiKey, printerURL}}
 */
function validateLogin(login) {
  if (!login.apiKey || !login.printerURL) {
    throw new ValidationException("printer apiKey or printerURL undefined");
  }

  return {
    apiKey: login.apiKey,
    printerURL: login.printerURL,
  };
}

function constructHeaders(apiKey, contentType = jsonContentType) {
  return {
    [contentTypeHeaderKey]: contentType, // Can be overwritten without problem
    [apiKeyHeaderKey]: apiKey,
  };
}

/**
 * Process an Axios response (default)
 * @param response
 * @param options
 * @returns {{data, status}|*}
 */
function processResponse(response, options = { unwrap: true }) {
  if (options.unwrap) {
    return response.data;
  }
  if (options.simple) {
    return { status: response.status, data: response.data };
  }
  return response;
}

/**
 * Process a Got based request
 * @param response
 * @param options
 * @returns {{data, status}|*}
 */
async function processGotResponse(response, options = { unwrap: true }) {
  if (options.unwrap) {
    return JSON.parse(response.body);
  }
  if (options.simple) {
    const data = JSON.parse(response.body);
    return { status: response.statusCode, data };
  }
  return response;
}

module.exports = {
  validateLogin,
  constructHeaders,
  processResponse,
  processGotResponse,
};
