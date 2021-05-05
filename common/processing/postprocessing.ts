import {PuppeteerResult} from "../model/puppeteerResults";
import {AggregatedPuppeteerResult} from "../model/aggregatedPuppeteerResult";
import {AggregatedPagespeedResult} from "../model/aggregatedPagespeedResult";
import {PageSpeedResult} from "../model/pageSpeedResult";
import {buildMapResult} from "../stats";

// Postprocessing for Puppeteer results
// Takes in an array of results, filters out 0.0 values and then calculates the mean, variance and standard deviation of
// the results array

// Returns the stats in the for of a map/JavaScript object
export async function postprocessPuppeteer(results: Array<PuppeteerResult>): Promise<AggregatedPuppeteerResult> {
    let transferSizeStats = buildMapResult(results.map(res => res.transferSize).filter(r => r > 0.0));
    let decodedSizeStats = buildMapResult(results.map(res => res.decodedBodySize).filter(r => r > 0.0));
    let encodedSizeStats = buildMapResult(results.map(res => res.encodedBodySize).filter(r => r > 0.0));
    let resourcesTransferredStats = buildMapResult(results.map(res => res.numTransferred));
    return new AggregatedPuppeteerResult(results.length, transferSizeStats, decodedSizeStats, encodedSizeStats, resourcesTransferredStats);
}

// Postprocessing for PageSpeed results
// Takes in an array of results, filters out 0.0 values and then calculates the mean, variance and standard deviation of
// the results array

// Returns the stats in the for of a map/JavaScript object
export async function postprocessPageSpeed(results: Array<PageSpeedResult>): Promise<AggregatedPagespeedResult> {
    let performanceStats = buildMapResult(results.map(res => res.performance));
    let pwaStats = buildMapResult(results.map(res => res.progressiveWebApp));
    let seoStats = buildMapResult(results.map(res => res.seo));
    let accessibilityStats = buildMapResult(results.map(res => res.accessibility));
    let bestPracticesStats = buildMapResult(results.map(res => res.bestPractices));
    let fcpStats = buildMapResult(results.map(res => res.firstContentfulPaint));
    let siStats = buildMapResult(results.map(res => res.speedIndex));
    let lcpStats = buildMapResult(results.map(res => res.largestContentfulPaint));
    let ttiStats = buildMapResult(results.map(res => res.timeToInteractive));
    let tbtStats = buildMapResult(results.map(res => res.totalBlockingTime));
    let clsStats = buildMapResult(results.map(res => res.cumulativeLayoutShift));

    return new AggregatedPagespeedResult(
        results.length, performanceStats, pwaStats,
        seoStats, accessibilityStats, bestPracticesStats,
        fcpStats, siStats, lcpStats,
        ttiStats, tbtStats, clsStats);
}
