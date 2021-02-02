import {UrlData} from "./model/urlData";
import {PageSpeedResult} from "./model/pageSpeedResult";
import {ExperimentProcess} from "./model/interfaces/experimentProcess";
import {NUM_PUPPETEER_ITERATIONS} from "./util/constants";

const request = require('request-promise-native');
export let INCOMPLETE_PAGESPEED = 0;

export class PagesSpeed implements ExperimentProcess<PageSpeedResult> {

    async runExperiment(urlData: UrlData, params: any): Promise<Array<PageSpeedResult>> {
        if (params.strategy !== "DESKTOP" && params.strategy !== "MOBILE") {
            throw new Error("Invalid strategy passed");
        }
        let results: Array<PageSpeedResult> = [];

        for (let i = 0; i < NUM_PUPPETEER_ITERATIONS; i++) {
            console.log(`[${params.strategy}] - PageSpeed Iteration: ${i}`);
            let result: PageSpeedResult = await this.queryPageSpeed(urlData, params.strategy, params.APIKey);
            results.push(result);
        }
        return results;
    }

    async queryPageSpeed(inputURL: UrlData, strategy: string, APIKey: string): Promise<PageSpeedResult> {
        const GET_TEMPLATE = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${inputURL.url}%2F&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&strategy=${strategy}&key=${APIKey}`;

        try {
            let response = await request(GET_TEMPLATE, {json: true});
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
            console.log(ex);
        }
        let result: PageSpeedResult = new PageSpeedResult(inputURL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        result.isComplete = false;
        INCOMPLETE_PAGESPEED++;
        return result;
    }

}


