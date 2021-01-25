export let URLS_PATH = "resources/urls.txt";
export const NUM_PUPPETEER_ITERATIONS = 5;
export const RESULTS = "results/";
export let pathToBrowserExecutable = "";
export const HOME_PAGE = "https://www.google.ie";
export const PLATFORMS = ["DESKTOP", "MOBILE"];

export function setBrowser(path: string) {
    pathToBrowserExecutable = path;
}

export function setURLsPath(path: string) {
    URLS_PATH = path;
}