import {APIType, loadAPIKey, loadFile, millisToMinutesAndSeconds, writeToFle} from "./util/utils";
import {PLATFORMS, RESULTS, setBrowser, setURLsPath, URLS_PATH} from "./util/constants";
import {preprocessDesktopUrls} from "./processing/preprocessing";
import {Puppeteer} from "./puppeteer/puppeteer";
import {INCOMPLETE_PAGESPEED, PagesSpeed} from "./pagespeed";
import {ExperimentProcess} from "./model/interfaces/experimentProcess";
import {PuppeteerResult} from "./model/puppeteerResults";
import {PageSpeedResult} from "./model/pageSpeedResult";
import {postprocessPageSpeed, postprocessPuppeteer} from "./processing/postprocessing";
import {UrlData} from "./model/urlData";

const yargs = require("yargs");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");

initialize();
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

    let urls = JSON.parse(loadFile(URLS_PATH));
    if (urls.length === 0) {
        console.error("No urls to perform experiment with, exiting");
        process.exit(1);
    }
    let urlData: Array<UrlData> = preprocessDesktopUrls(urls);
    let apiKey: string = loadAPIKey(APIType.PAGESPEED);

    let puppeteer: ExperimentProcess<PuppeteerResult> = new Puppeteer();
    let pageSpeed: ExperimentProcess<PageSpeedResult> = new PagesSpeed();
    for (const platform of PLATFORMS) {
        for (const url of urlData) {
            const rawFilename: string = url.webpageName.concat("_raw.json");
            const aggregatedFileName: string = url.webpageName.concat("_agg.json");

            console.log(`Running Puppeteer experiment for [${platform}] - ${url.url}...`);

            puppeteer.runExperiment(url, {isMobile: platform === "MOBILE"}).then(results => {
                const puppeteerResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`).concat("puppeteer/");
                writeToFle(puppeteerResultPath, rawFilename, results)
                    .then(() => console.log("Finished writing data to " + puppeteerResultPath.concat(rawFilename)));
                postprocessPuppeteer(results)
                    .then(aggregatedPuppeteerResult => writeToFle(puppeteerResultPath, aggregatedFileName, aggregatedPuppeteerResult))
                    .then(() => console.log(`Finished running Puppeteer experiment for ${url.webpageName}`));
            })

            console.log(`Running PageSpeed experiment for  [${platform}] - ${url.url}...`);

            pageSpeed.runExperiment(url, {
                strategy: platform,
                APIKey: apiKey
            }).then(pageSpeedResults => {
                const pageSpeedResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`).concat("pagespeed/");

                writeToFle(pageSpeedResultPath, rawFilename, pageSpeedResults)
                    .then(() => console.log("Finished writing data to " + pageSpeedResultPath.concat(url.webpageName)));
                postprocessPageSpeed(pageSpeedResults)
                    .then(aggregatedPageSpeedResults => writeToFle(pageSpeedResultPath, aggregatedFileName, aggregatedPageSpeedResults))
                    .then(() => console.log(`Finished running PageSpeed experiment for ${url.webpageName}`));
            });
        }
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
    const fs = require('fs');
    if (!fs.existsSync("results/")) {
        fs.mkdirSync("results/");
        console.log("Had to create results directory");
    }
}
