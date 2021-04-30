//////////////////////////////////
//      GENERAL CONSTANTS     //
//////////////////////////////////
export const URLS_PATH: string = "resources/urls_500.json";
export const COMPLETED_URLS_PATH:string = "resources/complete.json";
export const FAILED_URLS_PATH:string = "resources/failed.json";
export function setExperimentIterations(num_iterations:number) {
    if (num_iterations <= 0) {
        console.warn(`Invalid number of iterations passed, ${num_iterations}. num_iterations must be greater than or equal to 0`)
        return;
    }
    NUM_EXPERIMENT_ITERATIONS = num_iterations;
}
export let NUM_EXPERIMENT_ITERATIONS: number = 5;
export const RESULTS: string = "results/";
export let pathToBrowserExecutable: string = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
export const LOG_PATH = "logs\\";
const ROOT = require("app-root-path").toString();
//////////////////////////////////
//      PUPPETEER CONSTANTS     //
//////////////////////////////////
export const PLATFORMS: Array<string> = ["DESKTOP", "MOBILE"];