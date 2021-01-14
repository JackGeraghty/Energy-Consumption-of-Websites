import {loadFile, writeToFle} from "./util/fileUtils";
import {PAGESPEED, URLS_PATH} from "./constants";
import {PageSpeedStrategy, queryPageSpeed, runPageSpeed} from "./pagespeed";
import {UrlData} from "./model/urlData";

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

console.log("Initializing experiment environment");

main();

function main():void {
    // Load in webpage urls
    let urls = JSON.parse(loadFile(URLS_PATH));
    if (urls.length === 0) {
        console.error("No urls to perform experiment with, exiting");
    }
    console.log(urls);
    let urlData = preprocessUrls(urls);

    runPageSpeed(urlData, PageSpeedStrategy.DESKTOP).then(() => console.log("Finished running pagespeed for DESKTOP"));
    runPageSpeed(urlData, PageSpeedStrategy.MOBILE).then(() => console.log("Finished running pagespeed for MOBILE"));

    runPuppeteer();
}

function preprocessUrls(urls: Array<string>): Array<UrlData> {
    let urlData:Array<UrlData> = [];
    for (let i = 0; i < urls.length; i++) {
        let url:string = urls[i].replace("/\\r?\\n|\\r/g", "");
        let name = url.substring("https://".length).split(".")[0];
        urlData.push(new UrlData(url, name));
    }
    return urlData;
}

async function runExperiment(function (urls,)) {

}

// pagespeed(urls).then((res) => {
//     for (let i = 0; i < res.length; i++) {
//         console.log(res[i]);
//     }
// });

