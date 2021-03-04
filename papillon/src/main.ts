import {delay, initializeDirs, millisToMinutesAndSeconds, replacer} from "../../common/util/utils";
import {loadURLS} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {HOME_PAGE} from "../../common/util/constants";
import {Papillon} from "./papillon";
import {PapillonResult} from "../../common/model/papillonResult";

const yargs = require("yargs");
const {exec} = require("child_process");
const request = require('request-promise-native');
const puppeteer = require('puppeteer-core');

const PAPILLON_DIR = "~/enterprise-papillon-v5.2/"

const APACHE_STARTUP: string = PAPILLON_DIR + "apache-tomcat-9.0.12/bin/startup.sh";
const APACHE_SHUTDOWN: string = PAPILLON_DIR + "\"apache-tomcat-9.0.12/bin/shutdown.sh";

const PAPILLON_CLIENT: string = PAPILLON_DIR + "papillon_client/client.jar";

const RESULTS_SERVER: string = "http://ec2-52-49-205-141.eu-west-1.compute.amazonaws.com:3000";

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

    if (!args.browser) {
        console.error("No browser path specified, exiting");
        process.exit(-1);
    }
    const browser: string = args.browser;

    const tag: string = args.tag ? args.tag : "T1";

    if (args.doMobile) {
        doMobile = args.doMobile == 'true';
    }
    const papillon: Papillon = new Papillon("267", "291", "294", "284", doMobile);

    // Start master node and give time for startup
    const apacheProcess = await exec(`sh ${APACHE_STARTUP}`);
    apacheProcess.stdout.pipe(process.stdout);
    console.log("Allowing server to start")
    await delay(10000);

    console.log("Starting Papillon Client Node");
    const papillonProcess = exec(`java -jar ${PAPILLON_CLIENT}`);
    papillonProcess.stdout.pipe(process.stdout);
    console.log("Allow Papillon Client to start");
    await delay(10000);

    console.log(`Tagging ${browser}`);
    const tagProcess = exec(`PAPILLON_TAG=${tag} ${browser} --remote-debugging-port=21222 --private`);
    tagProcess.stdout.pipe(process.stdout);
    console.log("Allowing browser to start");

    await delay(10000);
    console.log("Attempting to connect to browser");
    // To open up in the existing browser created by PAPILLON_TAG
    const endpointData = await request("http://127.0.0.1:21222/json/version", {json: true});
    const endpoint = endpointData.webSocketDebuggerUrl;
    const controlledBrowser = await puppeteer.connect({browserWSEndpoint: endpoint, defaultViewport: null});
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

    console.log("Waiting for a decent amount of time to let things start properly");
    await delay(120000);
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
        const result: PapillonResult = await papillon.query(url, sTime);
        if (result) {
            console.log("Result received");
            console.log(JSON.stringify(result, replacer, 2));
            const postRequest = {
                uri: RESULTS_SERVER,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json: result,
            }
            console.log("Sending result to results server");
            request.post(postRequest, function (error: any, response: any, body: any) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                } else {
                    console.log(error);
                }
            });
        } else {
            console.log("No result, something went wrong :(");
        }
    }

    console.log("Finished taking data, shutting down");

    const shutdownProcess = exec(`sh ${APACHE_SHUTDOWN}`);
    shutdownProcess.stdout.pipe(process.stdout);
    await delay(2000);
    console.log("Killing Tag process");
    tagProcess.kill();
    console.log("Killing Papillon client");
    papillonProcess.kill();
}
