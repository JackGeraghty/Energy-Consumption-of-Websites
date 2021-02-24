import {COMPLETED_URLS_PATH, FAILED_URLS_PATH, PLATFORMS, RESULTS} from "../../common/util/constants";
import {
    APIType,
    initializeDirs,
    loadAPIKey,
    millisToMinutesAndSeconds,
    replacer,
    writeToFle
} from "../../common/util/utils";
import {preprocessDesktopUrls} from "../../common/processing/preprocessing";
import {UrlData} from "../../common/model/urlData";
import {INCOMPLETE_PAGESPEED, PagesSpeed} from "./pagespeed";
import {PageSpeedResult} from "../../common/model/pageSpeedResult";
import {postprocessPageSpeed} from "../../common/processing/postprocessing";
import {loadURLS, updateFile} from "../../common/util/toleranceUtils";

const fs = require('fs');

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
    console.log(`Number of incomplete pagespeed results : ${INCOMPLETE_PAGESPEED}`);
    let endTime: Date = new Date();
    console.log(`Time taken : ${millisToMinutesAndSeconds(endTime.valueOf() - startTime.valueOf())}`);
});

initializeDirs();
main();

async function main(): Promise<void> {
    const urlData: [Array<string>, Array<string>, Array<string>] = loadURLS("resources/urls_retry.json");
    const urls: Array<UrlData> = preprocessDesktopUrls(urlData[0]);
    const complete: Array<string> = urlData[1];
    const failed: Array<string> = urlData[2];

    const apiKey: string = loadAPIKey(APIType.PAGESPEED);
    const pageSpeed: PagesSpeed = new PagesSpeed();
    for (const url of urls) {
        let failedUrl:boolean = false;
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
            const pageSpeedResultPath: string = RESULTS.concat(url.webpageName).concat(`_${platform}/`).concat("pagespeed/");

            writeToFle(pageSpeedResultPath, rawFilename, result.filter(result => !!result))
                .then(() => console.log("Finished writing data to " + pageSpeedResultPath.concat(url.webpageName)));
            postprocessPageSpeed(result.filter(result => !!result))
                .then(aggregatedPageSpeedResults => writeToFle(pageSpeedResultPath, aggregatedFileName, aggregatedPageSpeedResults))
                .then(() => console.log(`Finished running PageSpeed experiment for ${url.webpageName}`));
        }

        if (!failedUrl) {
            complete.push(url.originalURL);
            updateFile(JSON.stringify(complete, replacer, 2), COMPLETED_URLS_PATH);
        }
    }
}

