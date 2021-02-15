import {ExperimentResult} from "../interfaces/experimentResult";
import {UrlData} from "../urlData";
import {PapillonMetric} from "../interfaces/papillonMetric";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;
    // Each metric is stored as a time series where each entry has a timestamp and a value
    energyTimeSeries: Array<PapillonMetric>;
    networkTimeSeries: Array<PapillonMetric>;
    memoryTimeSeries: Array<PapillonMetric>;

    constructor(urlData: UrlData, energyTimeSeries: Array<PapillonMetric>, networkTimeSeries: Array<PapillonMetric>, memoryTimeSeries: Array<PapillonMetric>) {
        this.urlData = urlData;
        this.energyTimeSeries = energyTimeSeries;
        this.networkTimeSeries = networkTimeSeries;
        this.memoryTimeSeries = memoryTimeSeries;
    }
}