//////////////////////////////////
//      GENERAL CONSTANTS     //
//////////////////////////////////
const appRoot = require('app-root-path');
export const URLS_PATH: string = "resources/urls.txt";
export const NUM_EXPERIMENT_ITERATIONS: number = 5;
export const RESULTS: string = "results/";
export const HOME_PAGE: string = "https://www.google.ie";
export let pathToBrowserExecutable: string = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
export const LOG_PATH = "logs\\";

//////////////////////////////////
//      PUPPETEER CONSTANTS     //
//////////////////////////////////
export const PLATFORMS: Array<string> = ["DESKTOP", "MOBILE"];

//////////////////////////////////
//      PAPILLON CONSTANTS      //
//////////////////////////////////

/** The length of the time window in which to gather metrics for a given url using Papillon */
export const PAPILLON_WINDOW_TIME: number = 30000;
/** The desired number of data points to collect during the Papillon window time */
export const NUM_DATA_POINTS: number = 1000;

export const PAPILLON_PORT_NUM: number = 8080;

export const PAPILLON_HOST_NAME: string = "localhost"