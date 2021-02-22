import {delay, initializeDirs, millisToMinutesAndSeconds, replacer, writeToFle} from "../../common/util/utils";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";
import {UrlData} from "../../common/model/urlData";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {
    COMPLETED_URLS_PATH,
    FAILED_URLS_PATH,
    HOME_PAGE,
    NUM_EXPERIMENT_ITERATIONS,
    PAPILLON_WINDOW_TIME,
    pathToBrowserExecutable,
    RESULTS,
    SCRIPTS
} from "../../common/util/constants";
import {Papillon} from "./papillon";
import {postprocessPapillon} from "../../common/processing/postprocessing";
import {PapillonResult} from "../../common/model/papillonResult";

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

    if (!args.apache) {
        console.error("No path to apache startup script specified, exiting");
        process.exit(-1);
    }
    if (!args.papillon) {
        console.error("No path to papillon jar specified, exiting");
        process.exit(-1);
    }

    console.log("Starting Papillon server");
    console.log(SCRIPTS);

    // Start the apache server and the Papillon client
    await exec(`sudo sh ${SCRIPTS}/startPapillon.sh ${args.apache} ${args.papillon}`, (err: Error, stdout: any, stderr: any) => {
        if (err) throw err;
        if (stderr) console.error(stderr);
        console.log(stdout);
    });

/*
    // Tag chrome as a process and allow for stabilization
    await exec(`PAPILLON_TAG=CHROME ${browserPath} `, (err: Error, stdout: any, stderr: any) => {
        if (stderr) console.error(stderr);
        console.log(stdout);
    });
*/
    console.log("Papillon server started, allowing for stabilization");
    await (delay(PAPILLON_WINDOW_TIME));

    const papillon: Papillon = new Papillon(1, 1, 1, 1);

    for (const url of urls) {
        const rawFilename: string = url.webpageName.concat("_raw.json");
        const aggregatedFileName: string = url.webpageName.concat("_agg.json");

        console.log(`Gathering metrics for ${url.url}`);
        const resultsPath: string = RESULTS.concat(`${url.webpageName}/`);

        const results: Array<PapillonResult> = [];
        for (let i = 0; i < NUM_EXPERIMENT_ITERATIONS; i++) {
            const startTime = new Date().getTime();
            console.log(`\tStart time for iteration ${i + 1} of ${url.originalURL} = ${startTime}`);

            //navigate to the page
            try {
                await exec(`sh ${SCRIPTS}/navigateTo.sh ${browserPath} ${url.url}`, (err: Error, stdout: any, stderr: any) => {
                    if (err) throw err;
                    if (stderr) console.error(stderr);
                    console.log(stdout);
                });
                console.log("Allowing webpage to load...");
                await delay(PAPILLON_WINDOW_TIME);
                // navigate back to home and allow stabilization
                await exec(`sh ${SCRIPTS}/navigateTo.sh ${browserPath} ${HOME_PAGE}`, (err: Error, stdout: any, stderr: any) => {
                    if (err) throw err;
                    if (stderr) console.error(stderr);
                    console.log(stdout);
                });
                // Start taking data since it can just run in the background while the following await delay occurs
                papillon.query(url, startTime, startTime + PAPILLON_WINDOW_TIME).then(res => {
                    if (!!res) {
                        results.push(res);
                    } else {
                        throw "Null result returned from Query";
                    }
                });
                console.log("Waiting for browser stabilization...")
                // Allow for the browser to stabilize again at the home page
                await delay(PAPILLON_WINDOW_TIME);
            } catch (ex) {
                failed.push(url.originalURL);
                updateFile(JSON.stringify(failed, replacer, 2), FAILED_URLS_PATH);
                break;
            }
        }

        writeToFle(resultsPath, rawFilename, results).then(() => console.log("Finished writing data to " + resultsPath.concat(rawFilename)));
        postprocessPapillon(results)
            .then(res => writeToFle(resultsPath, aggregatedFileName, res)
                .then(() => console.log("Finished writing data to " + resultsPath.concat(rawFilename))));
        completed.push(url.originalURL);
        updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH)
    }
}
