import {UrlData} from "../../common/model/urlData";
import {PageSpeedResult} from "../../common/model/puppeteer/pageSpeedResult";
import {ExperimentProcess} from "../../common/model/interfaces/experimentProcess";
import {LOG_PATH, NUM_EXPERIMENT_ITERATIONS} from "../../common/util/constants";
import {Logger} from "../../common/util/logger";

const request = require('request-promise-native');
export let INCOMPLETE_PAGESPEED = 0;

export class PagesSpeed implements ExperimentProcess<PageSpeedResult> {
    failureLogger: Logger;

    constructor() {
        const currentTime: Date = new Date();
        const logPath = LOG_PATH.concat(`pagespeed\\failure_log_${currentTime.toISOString().substring(0, 10)}_${currentTime.getHours()}_${currentTime.getMinutes()}.txt`);
        this.failureLogger = new Logger(logPath);
    }

    async runExperiment(urlData: UrlData, params: any): Promise<Array<PageSpeedResult>> {
        if (params.strategy !== "DESKTOP" && params.strategy !== "MOBILE") {
            throw new Error("Invalid strategy passed");
        }
        let results: Array<PageSpeedResult> = [];

        for (let i = 0; i < NUM_EXPERIMENT_ITERATIONS; i++) {
            console.log(`[${params.strategy}] - PageSpeed Iteration: ${i}`);
            let result: PageSpeedResult = await this.queryPageSpeed(urlData, params.strategy, params.APIKey, 0);
            if (result == null) {
                console.log("Failed iteration, abandoning current urlData");
                return null;
            }
            results.push(result);
        }
        return results;
    }

    async queryPageSpeed(inputURL: UrlData, strategy: string, APIKey: string, attemptNum: number): Promise<PageSpeedResult> {
        console.log("Attempt  = " + attemptNum);
        const GET_TEMPLATE = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${inputURL.url}%2F&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&strategy=${strategy}&key=${APIKey}`;

        try {
            let response = await request(GET_TEMPLATE, {json: true});

            if (response.statusCode == 500) {
                console.log(response.message);
                return null;
            }
            let fcp: number = response.lighthouseResult.audits['first-contentful-paint'].numericValue;
            let speedIndex: number = response.lighthouseResult.audits['speed-index'].numericValue;
            let lcp: number = response.lighthouseResult.audits['largest-contentful-paint'].numericValue;
            let tti: number = response.lighthouseResult.audits['interactive'].numericValue;
            let tbt: number = response.lighthouseResult.audits['total-blocking-time'].numericValue;
            let cls: number = response.lighthouseResult.audits['cumulative-layout-shift'].numericValue;

            const scoring = {
                performance: response.lighthouseResult.categories.performance.score,
                pwa: response.lighthouseResult.categories.pwa.score,
                seo: response.lighthouseResult.categories.seo.score,
                accessibility: response.lighthouseResult.categories.accessibility.score,
                bestPractices: response.lighthouseResult.categories['best-practices'].score
            }
            return new PageSpeedResult(
                inputURL, scoring.performance, scoring.pwa,
                scoring.seo, scoring.accessibility, scoring.bestPractices,
                fcp, speedIndex, lcp,
                tti, tbt, cls);
        } catch (ex) {
            console.log("Failed to get proper response from " + JSON.stringify(inputURL, null, 2));

            if (attemptNum == 0) {
                console.log(ex);
            }
            if (attemptNum < 4) {
                let n = attemptNum + 1;
                console.log(n);
                await this.queryPageSpeed(inputURL, strategy, APIKey, n);
            }
            // console.log("This site is weird! " + "platform = " + strategy + "   " + JSON.stringify(inputURL, null, 2));
            this.failureLogger.log(`${strategy} -` + JSON.stringify(inputURL, null, 2));
            ++INCOMPLETE_PAGESPEED;

            return null;
        }
    }

}


