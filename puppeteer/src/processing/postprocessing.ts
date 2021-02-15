import {PuppeteerResult} from "../../../common/model/puppeteer/puppeteerResults";
import {AggregatedPuppeteerResult} from "../../../common/model/puppeteer/aggregatedPuppeteerResult";
import {AggregatedPagespeedResult} from "../../../common/model/puppeteer/aggregatedPagespeedResult";
import {PageSpeedResult} from "../../../common/model/puppeteer/pageSpeedResult";
import {buildMapResult} from "../../../common/stats";

export async function postprocessPuppeteer(results: Array<PuppeteerResult>): Promise<AggregatedPuppeteerResult> {
    let transferSizeStats = buildMapResult(results.map(res => res.transferSize));
    let decodedSizeStats = buildMapResult(results.map(res => res.decodedBodySize));
    let encodedSizeStats = buildMapResult(results.map(res => res.encodedBodySize));
    let resourcesTransferredStats = buildMapResult(results.map(res => res.numTransferred));
    return new AggregatedPuppeteerResult(results.length, transferSizeStats, decodedSizeStats, encodedSizeStats, resourcesTransferredStats);
}

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



