import {UrlData} from "../urlData";
import {ExperimentResult} from "../interfaces/experimentResult";

export class PuppeteerResult implements ExperimentResult {
    urlData: UrlData;
    numTransferred: number;
    encodedBodySize: number;
    decodedBodySize: number;
    transferSize: number;
    resourcesList: Array<[string, number, number, number, number]>;

    constructor(urlData: UrlData, numTransferred: number, encodedBodySize: number, decodedBodySize: number, transferSize: number, resourcesList: Array<[string, number, number, number, number]>) {
        this.urlData = urlData;
        this.numTransferred = numTransferred;
        this.encodedBodySize = encodedBodySize;
        this.decodedBodySize = decodedBodySize;
        this.transferSize = transferSize;
        this.resourcesList = resourcesList;
    }

}