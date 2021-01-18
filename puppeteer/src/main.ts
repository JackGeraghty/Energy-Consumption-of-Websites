import {loadFile, writeToFle} from "./util/fileUtils";
import {setBrowser, setURLsPath, URLS_PATH} from "./util/constants";
import {Puppeteer, runPuppeteer} from "./puppeteer";
import {postProcessPuppeteer} from "./processing/postProcessing";
import {preprocessDesktopUrls} from "./processing/preProcessing";

const yargs = require("yargs");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");

initialize();

main();

async function main(): Promise<void>{
    // Load in webpage urls
    let urls = JSON.parse(loadFile(URLS_PATH));
    if (urls.length === 0) {
        console.error("No urls to perform experiment with, exiting");
        process.exit(1);
    }
    console.log(urls);
    let urlData = preprocessDesktopUrls(urls);

    // runPageSpeed(urlData, "DESKTOP").then(() => console.log("Finished running pagespeed for DESKTOP and MOBILE"));

    for (let url of urlData) {
        console.log("Running puppeteer for " + url.webpageName);
        let result = await runPuppeteer(url);
        let postProcessResult = await postProcessPuppeteer(result);
        writeToFle(Puppeteer.concat(url.filename).concat("/"), url.webpageName.concat("_raw.json"), result);
        writeToFle(Puppeteer.concat(url.filename).concat("/"), url.webpageName.concat("_agg.json"), postProcessResult);
    }
}

function initialize() {
    let args = yargs.argv;
    if (!args.browserPath) {
        console.warn("No browser path specified, quitting");
        process.exit(1);
    }
    setBrowser(args.browserPath);
    if (args.URLS) setURLsPath(args.URLS);
}
