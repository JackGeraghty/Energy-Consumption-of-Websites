import {PuppeteerResult} from "../model/puppeteerResults";
import {AggregatedPuppeteerResult} from "../model/aggregatedPuppeteerResult";
import {AggregatedPagespeedResult} from "../model/aggregatedPagespeedResult";
import {PageSpeedResult} from "../model/pageSpeedResult";
import {buildMapResult} from "../stats";
import {PapillonResult} from "../model/papillonResult";
import {AggregatedPapillonResult} from "../model/aggregatedPapillonResult";

export async function postprocessPuppeteer(results: Array<PuppeteerResult>): Promise<AggregatedPuppeteerResult> {
    let transferSizeStats = buildMapResult(results.map(res => res.transferSize).filter(r => r > 0.0));
    let decodedSizeStats = buildMapResult(results.map(res => res.decodedBodySize).filter(r => r > 0.0));
    let encodedSizeStats = buildMapResult(results.map(res => res.encodedBodySize).filter(r => r > 0.0));
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

export async function postprocessPapillon(results: Array<PapillonResult>): Promise<AggregatedPapillonResult> {
    const power = buildMapResult(results.map(res => res.power));
    const network = buildMapResult(results.map(res => res.network));
    const memory = buildMapResult(results.map(res => res.memory));

    return new AggregatedPapillonResult(results.length, power, network, memory);
}