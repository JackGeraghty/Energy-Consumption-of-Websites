import {AggregatedExperimentResult} from "../interfaces/aggregatedExperimentResult";

export class AggregatedPuppeteerResult implements AggregatedExperimentResult {
    numSamples: number;
    transferSizeStats: Map<string, number>;
    decodedSizeStats: Map<string, number>;
    encodedSizeStats: Map<string, number>;
    transferredResourcesStats: Map<string, number>;

    constructor(numSamples: number, transferSizeStats: Map<string, number>, decodedSizeStats: Map<string, number>, encodedSizeStats: Map<string, number>, transferredResourcesStats: Map<string, number>) {
        this.numSamples = numSamples;
        this.transferSizeStats = transferSizeStats;
        this.decodedSizeStats = decodedSizeStats;
        this.encodedSizeStats = encodedSizeStats;
        this.transferredResourcesStats = transferredResourcesStats;
    }

}