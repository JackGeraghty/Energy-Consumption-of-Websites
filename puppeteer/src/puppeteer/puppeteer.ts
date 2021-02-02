import {UrlData} from "../model/urlData";
import {NUM_PUPPETEER_ITERATIONS, pathToBrowserExecutable} from "../util/constants";
import {PuppeteerResult} from "../model/puppeteerResults";
import {ExperimentProcess} from "../model/interfaces/experimentProcess";

const puppeteer = require('puppeteer-core');
const phone = puppeteer.devices['iPhone X'];

export class Puppeteer implements ExperimentProcess<PuppeteerResult> {

    async runExperiment(urlData: UrlData, params: any): Promise<Array<PuppeteerResult>> {
        let platform = params.isMobile ? "MOBILE" : "DESKTOP";
        let promisedValues: Array<PuppeteerResult> = [];
        for (let i = 0; i < NUM_PUPPETEER_ITERATIONS; i++) {
            console.log(`[${platform}] - Puppeteer Iteration: ${i}`);
            let result: PuppeteerResult = await this.queryPuppeteerNoCache(urlData, params.isMobile);
            promisedValues.push(result);
        }
        console.log();
        return promisedValues;
    }

    async queryPuppeteerNoCache(urlData: UrlData, isMobile: boolean): Promise<PuppeteerResult> {
        return (async () => {
            const browser = await puppeteer.launch(
                {
                    executablePath: pathToBrowserExecutable,
                    headless: true,
                    defaultViewport: null
                });
            const page = await browser.newPage();

            if (isMobile) {
                await page.emulate(phone);
            }

            await page.setDefaultNavigationTimeout(0);
            await page.setCacheEnabled(false);

            try {
                await page.goto(urlData.url);
            } catch (ex) {
                console.log(JSON.stringify(urlData, null, 2));
                console.log(ex);
            }
            const perfEntries = JSON.parse(
                await page.evaluate(() => JSON.stringify(performance.getEntries()))
            );

            let totalEncodedBodySize: number = 0;
            let totalDecodedBodySize: number = 0;
            let totalTransferSize: number = 0;
            let resourcesList: Array<string> = [];

            for (let entry of perfEntries) {
                if (entry.entryType === "resource" || entry.entryType === "navigation") {
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
}
