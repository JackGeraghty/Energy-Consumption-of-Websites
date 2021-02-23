import {delay, initializeDirs, millisToMinutesAndSeconds} from "../../common/util/utils";
import {loadURLS} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {HOME_PAGE, PAPILLON_WINDOW_TIME, RESULTS, SCRIPTS} from "../../common/util/constants";
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

const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS();
const urls: Array<UrlData> = preprocessDesktopUrls(urlData[0]);
const completed: Array<string> = urlData[1];
const failed: Array<string> = urlData[2];

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', () => {
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});
main();

async function main() {
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

    const papillon: Papillon = new Papillon("dc1", "fl1", "rack1", "vm1(127.0.0.1)");

    for (const url of urls) {
        const rawFilename: string = url.webpageName.concat("_raw.json");
        const aggregatedFileName: string = url.webpageName.concat("_agg.json");

        console.log(`Gathering metrics for ${url.url}`);
        const resultsPath: string = RESULTS.concat(`${url.webpageName}/`);

        const startTime:number = new Date().getTime();

        const ex = exec(`sh ${SCRIPTS}/startPapillon.sh ${args.papillon} chrome-test ${browserPath} ${HOME_PAGE} ${url.url}`);
        ex.stdout.pipe(process.stdout);

        await delay(30000);

        console.log("Querying ");
        const result = await papillon.query(url, startTime + 25000, startTime + 25000 + PAPILLON_WINDOW_TIME);
        console.log(JSON.stringify(result, null, 2));
        // const results: Array<PapillonResult> = [];
        // for (let i = 0; i < NUM_EXPERIMENT_ITERATIONS; i++) {
        //     const startTime = new Date().getTime();
        //     console.log(`\tStart time for iteration ${i + 1} of ${url.originalURL} = ${startTime}`);
        //
        //     //navigate to the page
        //     try {
        //         await exec(`sh ${SCRIPTS}/navigateTo.sh ${browserPath} ${url.url}`, (err: Error, stdout: any, stderr: any) => {
        //             if (err) throw err;
        //             if (stderr) console.error(stderr);
        //             console.log(stdout);
        //         });
        //         console.log("Allowing webpage to load...");
        //         await delay(PAPILLON_WINDOW_TIME);
        //         // navigate back to home and allow stabilization
        //         await exec(`sh ${SCRIPTS}/navigateTo.sh ${browserPath} ${HOME_PAGE}`, (err: Error, stdout: any, stderr: any) => {
        //             if (err) throw err;
        //             if (stderr) console.error(stderr);
        //             console.log(stdout);
        //         });
        //         // Start taking data since it can just run in the background while the following await delay occurs
        //         papillon.query(url, startTime, startTime + PAPILLON_WINDOW_TIME).then(res => {
        //             if (!!res) {
        //                 results.push(res);
        //             } else {
        //                 throw "Null result returned from Query";
        //             }
        //         });
        //         console.log("Waiting for browser stabilization...")
        //         // Allow for the browser to stabilize again at the home page
        //         await delay(PAPILLON_WINDOW_TIME);
        //     } catch (ex) {
        //         failed.push(url.originalURL);
        //         updateFile(JSON.stringify(failed, replacer, 2), FAILED_URLS_PATH);
        //         break;
        //     }
        // }
        //
        // writeToFle(resultsPath, rawFilename, results).then(() => console.log("Finished writing data to " + resultsPath.concat(rawFilename)));
        // postprocessPapillon(results)
        //     .then(res => writeToFle(resultsPath, aggregatedFileName, res)
        //         .then(() => console.log("Finished writing data to " + resultsPath.concat(rawFilename))));
        // completed.push(url.originalURL);
        // updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH)
    }
}
