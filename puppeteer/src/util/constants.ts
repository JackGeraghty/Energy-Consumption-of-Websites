export let URLS_PATH = "resources/urls.txt";
export const DESKTOP_RESULTS = "_desktop";
export const MOBILE_RESULTS = "_mobile";
export const NUM_PUPPETEER_ITERATIONS = 5;

export let pathToBrowserExecutable = "";

export function setBrowser(path: string) {
    pathToBrowserExecutable = path;
}

export function setURLsPath(path: string) {
    URLS_PATH = path;
}