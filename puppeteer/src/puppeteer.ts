import {UrlData} from "./model/urlData";
import {NUM_PUPPETEER_ITERATIONS, pathToBrowserExecutable} from "./util/constants";
import {PuppeteerResult} from "./model/puppeteerResults";

const puppeteer = require('puppeteer-core');

export const Puppeteer = "results/puppeteer/"

async function queryPuppeteer(urlData: UrlData, isMobile = false): Promise<PuppeteerResult> {
    return (async () => {
        const browser = await puppeteer.launch(
            {
                executablePath: pathToBrowserExecutable,
                headless: true,
                defaultViewport: null
            });
        const page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);
        await page.setCacheEnabled(false);

        await page.goto(urlData.url);
        const perfEntries = JSON.parse(
            await page.evaluate(() => JSON.stringify(performance.getEntries()))
        );

        let totalEncodedBodySize: number = 0;
        let totalDecodedBodySize: number = 0;
        let totalTransferSize: number = 0;
        let resourcesList: Array<string> = [];

        for (let entry of perfEntries) {
            if (entry.entryType === "resource" || entry.entryType === "navigation") {
                // console.log( entry.encodedBodySize);
                totalEncodedBodySize += entry.encodedBodySize ? entry.encodedBodySize : 0;
                totalDecodedBodySize += entry.decodedBodySize ? entry.decodedBodySize : 0;
                totalTransferSize += entry.transferSize ? entry.transferSize : 0;
                resourcesList.push(entry.name);
            }
        }

        await browser.close();
        return new PuppeteerResult(urlData, perfEntries.length, totalEncodedBodySize, totalDecodedBodySize, totalTransferSize, resourcesList);
    })();
}

export async function runPuppeteer(url: UrlData): Promise<Array<PuppeteerResult>> {
    let promisedValues: Array<Promise<PuppeteerResult>> = [];
    for (let i = 0; i < NUM_PUPPETEER_ITERATIONS; i++) {
        promisedValues.push(queryPuppeteer(url));
    }
    return Promise.all(promisedValues);
}