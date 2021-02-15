import {UrlData} from "../urlData";
import {ExperimentResult} from "../interfaces/experimentResult";

export class PageSpeedResult implements ExperimentResult {
    urlData: UrlData;
    isComplete: boolean = true;
    performance: number;
    progressiveWebApp: number;
    seo: number;
    accessibility: number;
    bestPractices: number;

    firstContentfulPaint: number;
    speedIndex: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;

    constructor(urlData: UrlData, performance: number, progressiveWebApp: number,
                seo: number, accessibility: number, bestPractices: number,
                firstContentfulPaint: number, speedIndex: number, largestContentfulPaint: number,
                timeToInteractive: number, totalBlockingTime: number, cumulativeLayoutShift: number) {
        this.urlData = urlData;
        this.performance = performance;
        this.progressiveWebApp = progressiveWebApp;
        this.seo = seo;
        this.accessibility = accessibility;
        this.bestPractices = bestPractices;
        this.firstContentfulPaint = firstContentfulPaint;
        this.speedIndex = speedIndex;
        this.largestContentfulPaint = largestContentfulPaint;
        this.timeToInteractive = timeToInteractive;
        this.totalBlockingTime = totalBlockingTime;
        this.cumulativeLayoutShift = cumulativeLayoutShift;
    }
}
