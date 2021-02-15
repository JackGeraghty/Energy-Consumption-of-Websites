import {
    APIType,
    initializeDirs,
    loadAPIKey,
    loadFileAsJson,
    millisToMinutesAndSeconds,
    writeToFle
} from "../../common/util/utils";

import {pathToBrowserExecutable, PLATFORMS, RESULTS, URLS_PATH} from "../../common/util/constants";
import {preprocessDesktopUrls} from "./processing/preprocessing";
import {Puppeteer} from "./puppeteer/puppeteer";
import {INCOMPLETE_PAGESPEED, PagesSpeed} from "./pagespeed";
import {ExperimentProcess} from "../../common/model/interfaces/experimentProcess";
import {PuppeteerResult} from "../../common/model/puppeteer/puppeteerResults";
import {PageSpeedResult} from "../../common/model/puppeteer/pageSpeedResult";
import {postprocessPageSpeed, postprocessPuppeteer} from "./processing/postprocessing";
import {UrlData} from "../../common/model/urlData";

const yargs = require("yargs");

const doPuppeteer = true;
const doPageSpeed = false;
console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");

initializeDirs();

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', function () {
    console.log(`Number of incomplete pagespeed results : ${INCOMPLETE_PAGESPEED}`);
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main();

async function main(): Promise<void> {
    // Load in webpage urls

    let urls = loadFileAsJson(URLS_PATH);
    if (urls.length === 0) {
        console.error("No urls to perform experiment with, exiting");
        process.exit(1);
    }
    let urlData: Array<UrlData> = preprocessDesktopUrls(urls);
    let apiKey: string = loadAPIKey(APIType.PAGESPEED);

    let args = yargs.argv;
    if (!args.browserPath) {
        console.warn("No browser path specified, using default");
    }

    let puppeteer: ExperimentProcess<PuppeteerResult> = new Puppeteer(pathToBrowserExecutable);
    let pageSpeed: ExperimentProcess<PageSpeedResult> = new PagesSpeed();
    for (const url of urlData) {
        for (const platform of PLATFORMS) {
            const rawFilename: string = url.webpageName.concat("_raw.json");
            const aggregatedFileName: string = url.webpageName.concat("_agg.json");

            if (doPuppeteer) {
                console.log(`Running Puppeteer experiment for [${platform}] - ${url.url}...`);
                try {
                    let results = await puppeteer.runExperiment(url, {isMobile: platform === "MOBILE"});
                    if (results == null) {
                        console.log(`Skipping current ${url} due to unexpected failure in Puppeteer`);
                        continue;
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

            if (doPageSpeed) {
                console.log(`Running PageSpeed experiment for  [${platform}] - ${url.url}...`);
                let pageSpeedResults = await pageSpeed.runExperiment(url, {
                    strategy: platform,
                    APIKey: apiKey
                });
                if (pageSpeedResults == null) {
                    console.log("Skipping current " + JSON.stringify(urlData, null, 2) + "due to unexpected failure in PageSpeed");
                    continue;
                }
                const pageSpeedResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`).concat("pagespeed/");

                writeToFle(pageSpeedResultPath, rawFilename, pageSpeedResults.filter(result => !!result))
                    .then(() => console.log("Finished writing data to " + pageSpeedResultPath.concat(url.webpageName)));
                postprocessPageSpeed(pageSpeedResults.filter(result => !!result))
                    .then(aggregatedPageSpeedResults => writeToFle(pageSpeedResultPath, aggregatedFileName, aggregatedPageSpeedResults))
                    .then(() => console.log(`Finished running PageSpeed experiment for ${url.webpageName}`));

            }
        }
    }
}
