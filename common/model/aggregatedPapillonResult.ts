import {AggregatedExperimentResult} from "./interfaces/aggregatedExperimentResult";

export class AggregatedPapillonResult implements AggregatedExperimentResult {
    numSamples: number;
    power: Map<string, number>;
    network: Map<string, number>;
    memory: Map<string, number>;

    constructor(numSamples: number, power: Map<string, number>,
                network: Map<string, number>, memory: Map<string, number>) {
        this.numSamples = numSamples;
        this.power = power;
        this.network = network;
        this.memory = memory;
    }
}