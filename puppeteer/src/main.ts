import {initializeDirs, millisToMinutesAndSeconds, replacer, writeToFle} from "../../common/util/utils";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {UrlData} from "../../common/model/urlData";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";
import {Puppeteer} from "./puppeteer";
import {
    COMPLETED_URLS_PATH,
    FAILED_URLS_PATH,
    pathToBrowserExecutable,
    PLATFORMS,
    RESULTS
} from "../../common/util/constants";
import {postprocessPuppeteer} from "../../common/processing/postprocessing";

const yargs = require("yargs");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");

initializeDirs();

const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS();
const urls: Array<UrlData> = preprocessDesktopUrls(urlData[0]);
const completed: Array<string> = urlData[1];
const failed: Array<string> = urlData[2];
let currentURL:string;

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main();

async function main() {
    let args = yargs.argv;

    let browserPath:string;
    if (!args.browserPath) {
        console.warn("No browser path specified, using default");
        browserPath = pathToBrowserExecutable;
    } else {
        browserPath = args.browserPath;
    }
    const puppeteer: Puppeteer = new Puppeteer(browserPath);

    for (const url of urls) {
        currentURL = url.originalURL;
        let failedUrl = false;
        for (const platform of PLATFORMS) {
            const rawFilename: string = url.webpageName.concat("_raw.json");
            const aggregatedFileName: string = url.webpageName.concat("_agg.json");

            try {
                let results = await puppeteer.runExperiment(url, {isMobile: platform === "MOBILE"});
                if (results == null) {
                    console.log(`Skipping current ${platform}-${url} due to unexpected failure in Puppeteer`);
                    failed.push(url.originalURL);
                    updateFile(JSON.stringify(failed, replacer, 2), FAILED_URLS_PATH);
                    failedUrl = true;
                    break;
                }

                const puppeteerResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`).concat("puppeteer/");
                writeToFle(puppeteerResultPath, rawFilename, results)
                    .then(() => console.log("Finished writing data to " + puppeteerResultPath.concat(rawFilename)));
                postprocessPuppeteer(results)
                    .then(aggregatedPuppeteerResult => writeToFle(puppeteerResultPath, aggregatedFileName, aggregatedPuppeteerResult))
                    .then(() => console.log(`Finished running Puppeteer experiment for ${url.webpageName}`));
            } catch (ex) {
                console.log(ex);
            }
        }
        if (!failedUrl) {
            console.log("Updating completed list");
            completed.push(url.originalURL);
            updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH);
        }
    }
}
