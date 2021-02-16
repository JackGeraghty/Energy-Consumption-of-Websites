import {ExperimentResult} from "../interfaces/experimentResult";
import {UrlData} from "../urlData";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;
    power: number;
    memory: number;
    network: number;


    constructor(urlData: UrlData, power: number, memory: number, network: number) {
        this.urlData = urlData;
        this.power = power;
        this.memory = memory;
        this.network = network;
    }
}