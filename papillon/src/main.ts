import {delay, initializeDirs, millisToMinutesAndSeconds, replacer, writeToFle} from "../../common/util/utils";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {COMPLETED_URLS_PATH, FAILED_URLS_PATH, HOME_PAGE, RESULTS, SCRIPTS} from "../../common/util/constants";
import {Papillon} from "./papillon";

const yargs = require("yargs");
const {exec} = require("child_process");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");
initializeDirs();

const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS("resources/urls.txt");
const urls: Array<UrlData> = preprocessDesktopUrls(urlData[0]);
const completed: Array<string> = urlData[1];
const failed: Array<string> = urlData[2];
const puppeteer = require('puppeteer-core');
const phone = puppeteer.devices['iPhone X'];

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});
const request = require('request-promise-native');

main();

async function main() {
    let doMobile: boolean = false;

    let args = yargs.argv;

    if (!args.browserPath) {
        console.error("No browser path specified, exiting");
        process.exit(-1);
    }
    const browserPath: string = args.browserPath;

    if (!args.papillon) {
        console.error("No path to papillon jar specified, exiting");
        process.exit(-1);
    }

    if (args.doMobile) {
        doMobile = args.doMobile == 'true';
    }
    const papillon: Papillon = new Papillon("267", "291", "294", "284");

    for (const url of urls) {

        const startTime: number = Date.now();
        console.log("Starting Papillon Script")
        const ex = exec(`sh ${SCRIPTS}/startPapillon.sh ${args.papillon} Fire ${browserPath} ${HOME_PAGE} ${url.url}`);
        ex.stdout.pipe(process.stdout);

        // Allow browser to start
        await delay(25000);
        console.log("Attempting to connect to browser");
        // To open up in the existing browser created by PAPILLON_TAG
        const endpointData = await request("http://127.0.0.1:21222/json/version", {json: true});
        const endpoint = endpointData.webSocketDebuggerUrl;
        const browser = await puppeteer.connect({browserWSEndpoint: endpoint, defaultViewport: null});

        const rawFilename: string = url.webpageName.concat("_raw.json");
        // const aggregatedFileName: string = url.webpageName.concat("_agg.json");

        const resultsPath: string = RESULTS.concat(`${url.webpageName}/`);

        // waiting to align with script
        await delay(25000);

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setCacheEnabled(false);
        if (doMobile) {
            await page.emulate(phone);
        }
        console.log(`Launching ${url.url}`);
        page.goto(url.url);

        console.log("Waiting for experiment to run");
        await delay(65000);

        console.log("Querying ");
        const result = await papillon.query(url, startTime + 45000);
        if (result != null) {
            writeToFle(resultsPath, rawFilename, result).then(() => console.log(`Finished writing results to file ${resultsPath}/${rawFilename}`));
            completed.push(url.originalURL);
            updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH);
        } else {
            failed.push(url.originalURL);
            updateFile(JSON.stringify(failed, replacer, 2), FAILED_URLS_PATH);
        }

        // Give time for the server to shutdown properly
        await delay(45000);
    }
}
