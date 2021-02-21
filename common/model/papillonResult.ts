import {ExperimentResult} from "./interfaces/experimentResult";
import {UrlData} from "./urlData";
import {PapillonMetric} from "./interfaces/papillonMetric";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;

    powerConsumption: number;
    network: number;
    memory: number;

    constructor(urlData: UrlData, powerConsumption: number, network: number, memory: number) {
        this.urlData = urlData;
        this.powerConsumption = powerConsumption;
        this.network = network;
        this.memory = memory;
    }
}