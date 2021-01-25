export class AggregatedPagespeedResult implements AggregatedExperimentResult {
    numSamples: number;
    performance: Map<string, number>;
    progressiveWebApp: Map<string, number>;
    seo: Map<string, number>;
    accessibility: Map<string, number>;
    bestPractices: Map<string, number>;

    firstContentfulPaint: Map<string, number>;
    speedIndex: Map<string, number>;
    largestContentfulPaint: Map<string, number>;
    timeToInteractive: Map<string, number>;
    totalBlockingTime: Map<string, number>;
    cumulativeLayoutShift: Map<string, number>;

    constructor(numSamples: number, performance: Map<string, number>, progressiveWebApp: Map<string, number>, seo: Map<string, number>, accessibility: Map<string, number>, bestPractices: Map<string, number>, firstContentfulPaint: Map<string, number>, speedIndex: Map<string, number>, largestContentfulPaint: Map<string, number>, timeToInteractive: Map<string, number>, totalBlockingTime: Map<string, number>, cumulativeLayoutShift: Map<string, number>) {
        this.numSamples = numSamples;
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