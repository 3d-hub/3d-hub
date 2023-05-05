/**
 * Created by D. Zwart
 * Description: Installs the Windows Service for FDM Monster
 * v1.0
 * 05/05/2023
 */

const { Service } = require("node-windows");
const { join } = require("path");

// Create a new service object
const rootPath = join(__dirname, "fdm-monster/server/");
const svc = new Service({
  name: "FDM Monster",
  description: "The 3D Printer Farm server for managing your 100+ OctoPrints printers.",
  script: join(rootPath, "index.mjs"),
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  workingDirectory: rootPath,
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on("install", function () {
  svc.start();
  console.log("Install complete. Service exists:", svc.exists);
  console.log("Service running: ", svc.isRunning);
});

if (svc.isRunning) {
  svc.stop();
  svc.uninstall();
}

svc.install();
