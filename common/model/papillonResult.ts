import {ExperimentResult} from "./interfaces/experimentResult";
import {UrlData} from "./urlData";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;
    power: number;
    network: number;
    memory: number;

    constructor(urlData: UrlData, power: number, network: number, memory: number) {
        this.urlData = urlData;
        this.power = power;
        this.network = network;
        this.memory = memory;
    }
}