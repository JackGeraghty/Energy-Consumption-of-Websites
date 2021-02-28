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
const ec2Instance = "http://ec2-52-49-205-141.eu-west-1.compute.amazonaws.com:3000";
main();

async function main() {
    let doMobile: boolean = false;

    let args = yargs.argv;

    if (!args.browserPath) {
        console.error("No browser path specified, exiting");
        process.exit(-1);
    }
    const browserPath: string = args.browserPath;

    if (args.doMobile) {
        doMobile = args.doMobile == 'true';
    }
    const papillon: Papillon = new Papillon("267", "291", "294", "284");

    for (const url of urls) {

        console.log("Starting Papillon Script")
        const ex = exec(`sh ${SCRIPTS}/startPapillon.sh Fire ${browserPath}`);
        ex.stdout.pipe(process.stdout);

        // Allow browser to start
        await delay(30000);
        console.log("Attempting to connect to browser");
        // To open up in the existing browser created by PAPILLON_TAG
        const endpointData = await request("http://127.0.0.1:21222/json/version", {json: true});
        const endpoint = endpointData.webSocketDebuggerUrl;
        const browser = await puppeteer.connect({browserWSEndpoint: endpoint, defaultViewport: null});
        console.log("Connected to browser");
        const rawFilename: string = url.webpageName.concat("_raw.json");
        // const aggregatedFileName: string = url.webpageName.concat("_agg.json");

        const resultsPath: string = RESULTS.concat(`${url.webpageName}/`);
        console.log("Waiting to align with script");
        // waiting to align with script
        await delay(20000);

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.setCacheEnabled(false);
        if (doMobile) {
            await page.emulate(phone);
        }
        const sTime: number = Date.now();

        console.log(`Launching ${url.url}, timestamp=${sTime}`);
        page.goto(url.url);

        console.log("Waiting for experiment to run");
        await delay(65000);

        console.log("Querying ");
        const result = await papillon.query(url, sTime);
        if (result != null) {
            const postRequest = {
                uri: ec2Instance,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json: result,
            }
            request.post(postRequest,function (error:any, response:any, body:any) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                } else {
                    console.log(error);
                }
            });
            // writeToFle(resultsPath, rawFilename, result).then(() => console.log(`Finished writing results to file ${resultsPath}/${rawFilename}`));
            // completed.push(url.originalURL);
            // updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH);
        } else {
            console.log(`Failed current url ${url.url}`);
        }

        // Give time for the server to shutdown properly
        await delay(45000);
    }
}
