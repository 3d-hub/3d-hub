export const eventTypes = {
  ClientAuthed: "ClientAuthed",
  ClientClosed: "ClientClosed",
  ClientOpened: "ClientOpened",
  Connected: "Connected", // Not modeled yet
  Connecting: "Connecting",
  Disconnecting: "Disconnecting", // Not modeled yet
  Disconnected: "Disconnected", // Not modeled yet
  Dwelling: "Dwelling",
  Eject: "Eject",
  Error: "Error",
  EStop: "EStop",
  FileAdded: "FileAdded",
  FileDeselected: "FileDeselected",
  FileRemoved: "FileRemoved",
  FirmwareData: "FirmwareData", // Not modeled yet
  FolderAdded: "FolderAdded",
  FolderRemoved: "FolderRemoved", // Not modeled yet
  Home: "Home",
  MetadataAnalysisFinished: "MetadataAnalysisFinished",
  MetadataAnalysisStarted: "MetadataAnalysisStarted",
  MetadataStatisticsUpdated: "MetadataStatisticsUpdated",
  PositionUpdate: "PositionUpdate",
  PowerOff: "PowerOff",
  PowerOn: "PowerOn",
  PrintCancelled: "PrintCancelled",
  PrintCancelling: "PrintCancelling",
  PrintDone: "PrintDone",
  PrintFailed: "PrintFailed",
  PrintPaused: "PrintPaused",
  PrintResumed: "PrintResumed",
  PrintStarted: "PrintStarted",
  PrinterStateChanged: "PrinterStateChanged",
  TransferDone: "TransferDone",
  TransferStarted: "TransferStarted",
  UpdatedFiles: "UpdatedFiles",
  Upload: "Upload",
  UserLoggedIn: "UserLoggedIn",
  Waiting: "Waiting",
  ZChange: "ZChange",
} as const;

export type EventType = keyof typeof eventTypes;
