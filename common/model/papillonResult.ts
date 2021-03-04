import {ExperimentResult} from "./interfaces/experimentResult";
import {UrlData} from "./urlData";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;
    power: number;
    network: number;
    memory: number;

    powerSeries: Array<[number, number]>;
    networkSeries: Array<[number, number]>;
    memorySeries: Array<[number, number]>;
    isMobile: boolean;

    constructor(urlData: UrlData, power: number, network: number, memory: number, powerSeries: Array<[number, number]>,
                networkSeries: Array<[number, number]>, memorySeries: Array<[number, number]>, isMobile: boolean) {
        this.urlData = urlData;
        this.power = power;
        this.network = network;
        this.memory = memory;
        this.powerSeries = powerSeries;
        this.networkSeries = networkSeries;
        this.memorySeries = memorySeries;
        this.isMobile = isMobile;
    }
}