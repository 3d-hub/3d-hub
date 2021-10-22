jest.mock("../../server/middleware/auth");

const dbHandler = require("../db-handler");
const supertest = require("supertest");
const { AppConstants } = require("../../server/app.constants");
const { setupTestApp } = require("../../server/app-test");
const { expectInvalidResponse, expectOkResponse } = require("../extensions");
const Alert = require("../../server/models/Alert");
const { createTestPrinter } = require("./test-data/create-printer");
const DITokens = require("../../server/container.tokens");
const { asFunction, asValue } = require("awilix");

let request;

const alertsRoute = AppConstants.apiRoute + "/alert";
const getRoute = alertsRoute;
const createRoute = alertsRoute;
const updateRoute = (id) => `${alertsRoute}/${id}`;
const testAlertScriptRoute = `${alertsRoute}/test-alert-script`;

let configuredContainer;

beforeAll(async () => {
  await dbHandler.connect();
  const { server, container } = await setupTestApp(true);
  configuredContainer = container;

  request = supertest(server);
});

beforeEach(async () => {
  return Alert.deleteMany({});
});

function getNormalAlert(printerIdArray) {
  return {
    active: true,
    printer: printerIdArray,
    trigger: "tomorrow",
    message: "temperature hit the fan",
    scriptLocation: "../safe_location/script.js"
  };
}

async function createNormalAlert(request, printerIdArray) {
  const response = await request.post(createRoute).send(getNormalAlert(printerIdArray));

  expectOkResponse(response, {
    active: true,
    printer: printerIdArray
  });

  return response.body;
}

describe("AlertController", () => {
  it("should return empty alert list", async function () {
    const response = await request.get(getRoute).send();

    expect(response.body).toMatchObject([]);

    expectOkResponse(response);
  });

  it("should create new alert", async function () {
    const testPrinter = await createTestPrinter(request);
    await createNormalAlert(request, [testPrinter.id]);
  });

  it("should update existing alert", async function () {
    const testPrinter = await createTestPrinter(request);
    const alert = await createNormalAlert(request, [testPrinter.id]);

    const data = {
      ...alert,
      active: false
    };
    const response = await request.put(updateRoute(alert._id)).send(data);

    expectOkResponse(response, {
      active: false
    });
  });

  it("should delete existing alert", async function () {
    const testPrinter = await createTestPrinter(request);
    const alert = await createNormalAlert(request, [testPrinter.id]);

    const response = await request.delete(updateRoute(alert._id)).send();

    expectOkResponse(response);
  });

  it("should fire existing alert script", async function () {
    let triggered = false;

    // Mock the internal service
    configuredContainer.register({
      [DITokens.scriptService]: asValue({
        execute: () => {
          triggered = true;
        }
      })
    });

    // Trigger the 'script'
    const response = await request.post(testAlertScriptRoute).send({
      scriptLocation: "somefile.js",
      message: "Im triggered"
    });
    expectOkResponse(response);

    // Now we test our mock
    expect(triggered).toBeTruthy();
  });
});
