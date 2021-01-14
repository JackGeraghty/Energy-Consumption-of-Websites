import {PuppeteerResult} from "../model/puppeteerResults";
import {AggregatedPuppeteerResult} from "../model/aggregatedPuppeteerResult";
import {AggregatedPagespeedResult} from "../model/aggregatedPagespeedResult";
import {PageSpeedResult} from "../model/pageSpeedResult";

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

function mean(data: Array<number>): number {
    let mean = 0;
    for (let item of data) {
        mean += item;
    }
    return mean / data.length;
}

function variance(data: Array<number>, mean: number): number {
    let sum = 0;
    for (let item of data) {
        sum += Math.pow(item - mean, 2);
    }
    return sum / data.length;
}

function buildMapResult(data: Array<number>): Map<string, number> {
    let resultMap: Map<string, number> = new Map();
    let avg = mean(data);
    let v = variance(data, avg);
    let stddev = Math.sqrt(v);
    resultMap.set("mean", avg);
    resultMap.set("variance", v);
    resultMap.set("stddev", stddev);
    return resultMap;
}

