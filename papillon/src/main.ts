import {delay, initializeDirs, millisToMinutesAndSeconds, replacer} from "../../common/util/utils";
import {loadURLS} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {HOME_PAGE} from "../../common/util/constants";
import {Papillon} from "./papillon";
import {PapillonResult} from "../../common/model/papillonResult";

const yargs = require("yargs");
const request = require('request-promise-native');
const puppeteer = require('puppeteer-core');


console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");
initializeDirs();

const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS("resources/urls.json");
const urls: Array<UrlData> = preprocessDesktopUrls(urlData[0]);
const phone = puppeteer.devices['iPhone X'];

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main().then(()=> console.log("Finished running experiment"));

async function main() {
    let doMobile: boolean = false;

    let args = yargs.argv;

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
        // delay to allow browser stabilization at the homepage
        await delay(30000);

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
        await papillon.query(url, sTime);

    }

    console.log("Finished taking data, shutting down");
}
