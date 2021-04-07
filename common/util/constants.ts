//////////////////////////////////
//      GENERAL CONSTANTS     //
//////////////////////////////////
export const URLS_PATH: string = "resources/urls_500.json";
export const COMPLETED_URLS_PATH:string = "resources/complete.json";
export const FAILED_URLS_PATH:string = "resources/failed.json";

export const NUM_EXPERIMENT_ITERATIONS: number = 5;
export const RESULTS: string = "results/";
export const HOME_PAGE: string = "https://www.google.ie";
export let pathToBrowserExecutable: string = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
export const LOG_PATH = "logs\\";
const ROOT = require("app-root-path").toString();
export const SCRIPTS = ROOT + "/scripts";
//////////////////////////////////
//      PUPPETEER CONSTANTS     //
//////////////////////////////////
export const PLATFORMS: Array<string> = ["DESKTOP", "MOBILE"];

//////////////////////////////////
//      PAPILLON CONSTANTS      //
//////////////////////////////////

/** The length of the time window in which to gather metrics for a given url using Papillon */
export const PAPILLON_WINDOW_TIME: number = 60000;
/** The desired number of data points to collect during the Papillon window time */
export const NUM_DATA_POINTS: number = 1000;

export const PAPILLON_PORT_NUM: number = 8080;

export const PAPILLON_HOST_NAME: string = "localhost"
