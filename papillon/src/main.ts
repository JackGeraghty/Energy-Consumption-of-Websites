import {delay, initializeDirs, loadFileAsJson, millisToMinutesAndSeconds} from "../../common/util/utils";
import {STABILIZATION_TIME_MS, URLS_PATH} from "../../common/util/constants";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../puppeteer/src/processing/preprocessing";
import {Papillon} from "./papillon";

const {exec} = require("child_process");
const yargs = require("yargs");

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
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main();

async function main() {
    let urls = loadFileAsJson(URLS_PATH);
    if (urls.length === 0) {
        console.error("No urls to perform experiment with, exiting");
        process.exit(-1);
    }

    let args = yargs.argv;
    if (!args.browserPath) {
        console.warn("No browser path specified, quitting");
        process.exit(1);
    }

    let urlData: Array<UrlData> = preprocessDesktopUrls(urls);
    let papillon: Papillon = new Papillon();
    exec("sh ../../scripts/startPapillon.sh", (error:Error, stdout: any, stderr:any) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
    await delay(STABILIZATION_TIME_MS);
    for (const url of urls) {

    }

}