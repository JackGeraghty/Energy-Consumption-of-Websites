import {initializeDirs, millisToMinutesAndSeconds, replacer, writeToFle} from "../../common/util/utils";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {UrlData} from "../../common/model/urlData";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";
import {Puppeteer} from "./puppeteer";
import {COMPLETED_URLS_PATH, FAILED_URLS_PATH, LOG_PATH, PLATFORMS, RESULTS} from "../../common/util/constants";
import {postprocessPuppeteer} from "../../common/processing/postprocessing";

const yargs = require("yargs");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");
const args = yargs.argv;

initializeDirs(LOG_PATH.concat("\\puppteer"));

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main();

async function main() {
    const urls: Array<UrlData> = [];
    const multipleUrls: number = args.urls != null ? 1 : 0;
    console.log(`Multiple URLs : ${multipleUrls != 0}`);

    const pathToUrls: number = args.pathToUrlsFile != null ? 1 : 0;
    console.log(`Path to URLs : ${(pathToUrls != 0)}`);

    if (!(multipleUrls ^ pathToUrls)) {
        console.log(`Command lines arguments, --urls and --pathToUrlsFile, are mutually exclusive, only one can be used.`);
        process.exit(-1);
    }
    let doMobile: boolean;

    if (!args.doMobile) {
        doMobile = false;
    } else {
        doMobile = args.mobile.toUpperCase() == "TRUE";
    }
    console.log(`Do mobile : ${doMobile}`);

    if (!args.browserPath) {
        console.warn("No browser path given, exiting");
        process.exit(-1);
    }

    const browserPath: string = args.browserPath;
    const puppeteer: Puppeteer = new Puppeteer(browserPath);
    const completed: Array<string> = [];
    const failed: Array<string> = [];

    if (multipleUrls == 1) {

        const multipleUrls: Array<string> = args.urls.split(',');
        preprocessDesktopUrls(multipleUrls).forEach(u => urls.push(u));
    } else {
        const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS(args.pathToUrlsFile);
        if (args.wipeData) {
            console.log("Wiping completed and failed lists");
            urlData[1] = [];
            urlData[2] = [];
            updateFile(JSON.stringify(urlData[1]), COMPLETED_URLS_PATH);
            updateFile(JSON.stringify(urlData[2]), FAILED_URLS_PATH);
        }
        const updatedUrlData: [Array<string>, Array<string>, Array<string>] = loadURLS(args.pathToUrlsFile);
        preprocessDesktopUrls(updatedUrlData[0]).forEach(u => urls.push(u));
    }

    /*
        For each URL run the experiment and get a result. Write this result to a file, aggregate the results and also
        write those to a file. Update the completed and failed lists as necessary.
     */
    for (const url of urls) {
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

                const puppeteerResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`);
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
