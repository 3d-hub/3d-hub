const { Printer } = require("../../models/Printer");
const { expectValidationError } = require("../extensions");

describe("printer-schema", function () {
  it("should be valid for required properties", function (done) {
    const m = new Printer({
      apiKey: "asd",
      printerURL: "myawesomeprinter/",
      webSocketURL: "myawesomeprinter/",
      settingsAppearance: {},
    });

    m.validate(function (err) {
      expect(err).toBeFalsy();
      done();
    });
  });

  it("should be invalid if URLs, and apiKey properties are empty", function (done) {
    const m = new Printer({});

    m.validate(function (err) {
      expectValidationError(
        err,
        ["settingsAppearance", "webSocketURL", "printerURL", "apiKey"],
        true
      );
      done();
    });
  });

  it("should be invalid if printer misses webSocketURL", function (done) {
    const m = new Printer({
      printerURL: "myawesomeprinter/",
      apiKey: "asd",
      settingsAppearance: {}
    });

    m.validate(function (err) {
      expectValidationError(err, ["webSocketURL"], true);
      done();
    });
  });
});
