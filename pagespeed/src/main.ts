import {
    COMPLETED_URLS_PATH,
    FAILED_URLS_PATH,
    LOG_PATH,
    PLATFORMS,
    RESULTS,
    setExperimentIterations
} from "../../common/util/constants";
import {
    APIType,
    initializeDirs,
    loadAPIKey,
    millisToMinutesAndSeconds,
    replacer,
    writeToFile
} from "../../common/util/utils";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {UrlData} from "../../common/model/urlData";
import {INCOMPLETE_PAGESPEED, PagesSpeed} from "./pagespeed";
import {PageSpeedResult} from "../../common/model/pageSpeedResult";
import {postprocessPageSpeed} from "../../common/processing/postprocessing";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";

const yargs = require('yargs');
const args = yargs.argv;

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");


initializeDirs(LOG_PATH.concat("/pagespeed"));

let startTime: Date = new Date();
console.log(`Start time: ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`);
process.on('exit', function () {
    console.log(`Number of incomplete pagespeed results : ${INCOMPLETE_PAGESPEED}`);
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

main().then(() => process.exit(0));

async function main(): Promise<void> {
    const urls: Array<UrlData> = [];
    const multipleUrls: number = args.urls != null ? 1 : 0;
    console.log(`Multiple URLs : ${multipleUrls != 0}`);

    const pathToUrls: number = args.pathToUrlsFile != null ? 1 : 0;
    console.log(`Path to URLs : ${(pathToUrls != 0)}`);

    if (!(multipleUrls ^ pathToUrls)) {
        console.log(`Command lines arguments, --urls and --pathToUrlsFile, are mutually exclusive, only one can be used.`);
        process.exit(-1);
    }

    if (args.num_iterations) {
        setExperimentIterations(args.num_iterations);
        console.log(`Set the number of PageSpeed iterations/url to ${args.num_iterations}`);
    }

    const completed: Array<string> = [];
    const failed: Array<string> = [];

    if (multipleUrls == 1) {

        const multipleUrls: Array<string> = args.urls.split(',');
        preprocessDesktopUrls(multipleUrls).forEach(u => urls.push(u));
    } else {
        const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS(args.pathToUrlsFile);
        if (args.wipeData) {
            console.log("Wiping completed and failed lists");
            urlData[1] = [];
            urlData[2] = [];
            updateFile(JSON.stringify(urlData[1]), COMPLETED_URLS_PATH);
            updateFile(JSON.stringify(urlData[2]), FAILED_URLS_PATH);
        }
        const updatedUrlData: [Array<string>, Array<string>, Array<string>] = loadURLS(args.pathToUrlsFile);
        preprocessDesktopUrls(updatedUrlData[0]).forEach(u => urls.push(u));
    }


    const apiKey: string = loadAPIKey(APIType.PAGESPEED);
    const pageSpeed: PagesSpeed = new PagesSpeed();
    for (const url of urls) {
        let failedUrl: boolean = false;
        for (const platform of PLATFORMS) {
            const rawFilename: string = url.webpageName.concat("_raw.json");
            const aggregatedFileName: string = url.webpageName.concat("_agg.json");

            const result: Array<PageSpeedResult> = await pageSpeed.runExperiment(url, {
                strategy: platform,
                APIKey: apiKey
            });
            if (result == null) {
                console.error(`Failed PageSpeed iteration, pushing ${url.originalURL} to failed file`);
                failed.push(url.originalURL);
                updateFile(JSON.stringify(failed, replacer, 2), FAILED_URLS_PATH);
                failedUrl = true;
                break;
            }
            const pageSpeedResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`);

            writeToFile(pageSpeedResultPath, rawFilename, result.filter(result => !!result))
                .then(() => console.log("Finished writing data to " + pageSpeedResultPath.concat(url.webpageName)));
            postprocessPageSpeed(result.filter(result => !!result))
                .then(aggregatedPageSpeedResults => writeToFile(pageSpeedResultPath, aggregatedFileName, aggregatedPageSpeedResults))
                .then(() => console.log(`Finished running PageSpeed experiment for ${url.webpageName}`));
        }

        if (!failedUrl) {
            completed.push(url.originalURL);
            updateFile(JSON.stringify(completed, replacer, 2), COMPLETED_URLS_PATH);
        }
    }
}

