import { StoreOptions } from "vuex";
import { Printer } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend/printers.service";
import { StateInterface } from "@/store/state.interface";
import { ACTIONS } from "@/store/printers/printers.actions";
import { PrinterFilesService } from "@/backend";
import { MultiResponse } from "@/models/api/status-response.model";

export interface PrintersStateInterface {
  printers: Printer[];
  lastUpdated?: number;
}

export const MUTATIONS = {
  createPrinter: "createPrinter",
  savePrinters: "savePrinters",
  savePrinterFiles: "savePrinterFiles",
  deletePrinterFile: "deletePrinterFile"
};

export const printersState: StoreOptions<StateInterface> = {
  state: {
    printers: [],
    lastUpdated: undefined
  },
  mutations: {
    [MUTATIONS.createPrinter]: (state, printer: Printer) => {
      state.printers.push(printer);
      state.printers.sort((a, b) => (a.sortIndex > b.sortIndex ? 1 : -1));
    },
    [MUTATIONS.savePrinters]: (state, printers: Printer[]) => {
      state.printers = printers;
      state.lastUpdated = Date.now();
    },
    [MUTATIONS.savePrinterFiles]: (state: StateInterface, { printerId, files }) => {
      const printer = state.printers.find((p: Printer) => p.id === printerId);

      if (!printer?.fileList) return;

      printer.fileList.files = files;
      printer.fileList.fileCount = files.length;
    },
    [MUTATIONS.deletePrinterFile]: (state: StateInterface, { printerId, fullPath }) => {
      const printer = state.printers.find((p: Printer) => p.id === printerId);

      if (!printer?.fileList) {
        console.warn("Printer file list was falsy", printerId);
        return;
      }

      const deletedFileIndex = printer.fileList.files.findIndex((f) => f.path === fullPath);

      if (deletedFileIndex !== -1) {
        printer.fileList.files.splice(deletedFileIndex, 1);
        printer.fileList.fileCount = printer.fileList.files.length;
      } else {
        console.warn("File was not purged as it did not occur in state", fullPath);
      }
    }
  },
  getters: {
    printers: (state) => state.printers,
    printer: (state) => (printerId: string) => state.printers.find((p) => p.id === printerId),
    printerFiles: (state) => (printerId: string) =>
      state.printers.find((p) => p.id === printerId)?.fileList.files,
    lastUpdated: (state) => state.lastUpdated
  },
  actions: {
    [ACTIONS.createPrinter]: async ({ commit }, newPrinter) => {
      const data = await PrintersService.createPrinter(newPrinter);

      commit(MUTATIONS.createPrinter, data);

      return newPrinter;
    },
    [ACTIONS.savePrinters]: ({ commit }, newPrinters) => {
      commit(MUTATIONS.savePrinters, newPrinters);

      return newPrinters;
    },
    [ACTIONS.loadPrinters]: async ({ commit }) => {
      const data = await PrintersService.getPrinters();

      commit(MUTATIONS.savePrinters, data);

      return data;
    },
    [ACTIONS.getPrinterFiles]: async ({ commit }, { printerId, recursive }) => {
      const data = await PrinterFilesService.getFiles(printerId, recursive);

      commit(MUTATIONS.savePrinterFiles, { printerId, files: data });

      return data;
    },
    [ACTIONS.deletePrinterFile]: async ({ commit, getters }, { printerId, fullPath }) => {
      const response = (await PrinterFilesService.deleteFile(printerId, fullPath)) as MultiResponse;

      if (response.cache?.success) {
        commit(MUTATIONS.deletePrinterFile, { printerId, fullPath });
      } else {
        console.warn(
          "File was not purged from state as cache.success was false",
          response.cache?.success
        );
      }

      return getters.printerFiles(printerId);
    }
  }
};
