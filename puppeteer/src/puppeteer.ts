import {UrlData} from "../../common/model/urlData";
import {LOG_PATH, NUM_EXPERIMENT_ITERATIONS} from "../../common/util/constants";
import {PuppeteerResult} from "../../common/model/puppeteer/puppeteerResults";
import {ExperimentProcess} from "../../common/model/interfaces/experimentProcess";
import {Logger} from "../../common/util/logger";

const puppeteer = require('puppeteer-core');
const phone = puppeteer.devices['iPhone X'];

export class Puppeteer implements ExperimentProcess<PuppeteerResult> {
    pathToBrowser: string;
    failureLogger: Logger;

    constructor(pathToBrowser: string) {
        this.pathToBrowser = pathToBrowser;
        const currentTime: Date = new Date();
        const logPath = LOG_PATH.concat(`puppeteer\\failure_log_${currentTime.toISOString().substring(0, 10)}_${currentTime.getHours()}_${currentTime.getMinutes()}.txt`);
        this.failureLogger = new Logger(logPath);
    }

    async runExperiment(urlData: UrlData, params: any): Promise<Array<PuppeteerResult>> {
        let platform = params.isMobile ? "MOBILE" : "DESKTOP";
        let promisedValues: Array<PuppeteerResult> = [];
        for (let i = 0; i < NUM_EXPERIMENT_ITERATIONS; i++) {
            let currentDate: Date = new Date();
            console.log(`[${currentDate.getHours()} : ${currentDate.getMinutes()} : ${currentDate.getSeconds()}] - [${platform}]- ${urlData.webpageName} - Puppeteer Iteration: ${i}`);
            let result: PuppeteerResult = await this.queryPuppeteerNoCache(urlData, params.isMobile);
            if (result == null) {
                console.log("Failed iteration, abandoning current urlData");
                return null;
            }
            promisedValues.push(result);
        }
        return promisedValues;
    }

    async queryPuppeteerNoCache(urlData: UrlData, isMobile: boolean): Promise<PuppeteerResult> {

        const browser = await puppeteer.launch(
            {
                executablePath: this.pathToBrowser,
                headless: true,
                defaultViewport: null,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
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
            this.failureLogger.log(`Failed to goto url: ${urlData.url} ${ex}` + JSON.stringify(urlData, null, 2));
            const pages = await browser.pages();
            await Promise.all(pages.map((page: { close: () => any; }) => page.close()));
            await browser.close();
            return null;
        }
        console.log(`\tWaiting to get performance entries for ${urlData.webpageName}`);
        const perfEntries = JSON.parse(
            await page.evaluate(() => JSON.stringify(performance.getEntries()))
        );
        console.log(`\tTaken performance entries for ${urlData.webpageName}`);

        let metrics = await page.metrics();
        // console.log("Time Taken: " + metrics.TaskDuration);
        let totalEncodedBodySize: number = 0;
        let totalDecodedBodySize: number = 0;
        let totalTransferSize: number = 0;
        let resourcesList: Array<[string, number, number, number, number]> = [];

        for (let entry of perfEntries) {
            if (entry.entryType === "resource" || entry.entryType === "navigation") {
                totalEncodedBodySize += entry.encodedBodySize ? entry.encodedBodySize : 0;
                totalDecodedBodySize += entry.decodedBodySize ? entry.decodedBodySize : 0;
                totalTransferSize += entry.transferSize ? entry.transferSize : 0;
                resourcesList.push([entry.name, entry.transferSize, entry.encodedBodySize, entry.decodedBodySize, metrics.TaskDuration]);
            }
        }
        const pages = await browser.pages();
        await Promise.all(pages.map((page: { close: () => any; }) => page.close()));
        await browser.close();
        return new PuppeteerResult(urlData, perfEntries.length, totalEncodedBodySize, totalDecodedBodySize, totalTransferSize, resourcesList);
    }
}
