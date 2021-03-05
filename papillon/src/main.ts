import {delay, initializeDirs, millisToMinutesAndSeconds, replacer} from "../../common/util/utils";
import {loadURLS} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {HOME_PAGE, NUM_EXPERIMENT_ITERATIONS} from "../../common/util/constants";
import {Papillon} from "./papillon";
import {PapillonResult} from "../../common/model/papillonResult";

const yargs = require("yargs");
const request = require('request-promise-native');
const puppeteer = require('puppeteer-core');
const RESULTS_SERVER: string = "http://54.171.228.49:3000";

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
const failed: Array<string> = [];
const phone = puppeteer.devices['iPhone X'];

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main().then(() => {
    console.log("Finished running experiment, ready to be terminated");
});

async function main() {
    let doMobile: boolean = false;

    let args = yargs.argv;

    if (!args.timestamp) {
        console.log("No timestamp given, exiting");
        process.exit(1);
    }
    const currentDate: Date = new Date();
    const papillonTime: Array<string> = args.timestamp.split(":");
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDay(), +(papillonTime[0]), +(papillonTime[1]), +(papillonTime[2]));

    if (args.doMobile) {
        doMobile = args.doMobile == 'true';
    }
    const papillon: Papillon = new Papillon("267", "291", "294", "284", doMobile);

    console.log("Attempting to connect to browser");
    // To open up in the existing browser created by PAPILLON_TAG
    const endpointData = await request("http://127.0.0.1:21222/json/version", {json: true});
    const endpoint = endpointData.webSocketDebuggerUrl;
    let controlledBrowser;
    try {
        controlledBrowser = await puppeteer.connect({browserWSEndpoint: endpoint, defaultViewport: null});
    } catch (ex) {
        console.log(ex);
        console.log("Failed to connect to browser exiting");
        process.exit(1);
    }
    console.log("Connected to browser");

    // Create a page to work with and remove the landing page
    const workingPage = await controlledBrowser.newPage();
    if (doMobile) {
        await workingPage.emulate(phone);
        console.log("EMULATING MOBILE PAGES");
    }
    await workingPage.goto(HOME_PAGE);
    // Close any other tab that isn't the home page
    await (await controlledBrowser.pages())[0].close();

    for (const url of urls) {
        const results:Array<string> = [];
        let success: boolean = true;
        for (let i = 0; i < NUM_EXPERIMENT_ITERATIONS; i++) {
            console.log(`Iteration ${i+1}`);
            try {
                console.log("Delaying to allow sync with Papillon measurement time");
                await delay((calculateTimeToSync(targetDate, new Date()) - 2) * 1000);
                console.log(Date.now());
                const sTime = Math.floor(Date.now() / 1000);
                console.log(`Starting navigation to ${url.webpageName} at ${sTime}`);
                await workingPage.goto(url.url);
                console.log("Completed navigation, sleeping for experiment duration");
                await delay(60000);

                console.log("Navigating to home page");
                await workingPage.goto(HOME_PAGE);
                // allow an extra few seconds for data to be sent
                await delay(5000);

                console.log("Querying Papillon Master Node");

                let result: string = await papillon.query(url, sTime);
                if (result) {
                    results.push(result);
                }
                console.log("Allow stabilization");
                await delay(30000);
            } catch (ex) {
                success = false;
                failed.push(url.originalURL);
                const postRequest = {
                    uri: RESULTS_SERVER,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    json: {type: "failure", urls: JSON.stringify(failed)},
                }
                await request.post(postRequest, function (error: any, response: any, body: any) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                    } else {
                        console.log(error);
                    }
                });
                console.log(`Something went wrong, skipping ${url}`);
                break;
            }
        }
        if (success) {
            const postRequest = {
                uri: RESULTS_SERVER,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json: new PapillonResult(url, results, doMobile),
            }
            console.log("Sending result to results server");
            await request.post(postRequest, function (error: any, response: any, body: any) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                } else {
                    console.log(error);
                }
            });
        }
    }
    console.log("Finished taking data, shutting down");
}

function calculateTimeToSync(target: Date, current: Date) {
    console.log(target);
    console.log(current);

    const timeToSync = ((60 - current.getSeconds()) + target.getSeconds()) % 60;
    console.log(`Time to sync = ${timeToSync}`);
    return timeToSync;
}
