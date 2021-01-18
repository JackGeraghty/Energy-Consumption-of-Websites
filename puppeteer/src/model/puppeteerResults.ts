import {UrlData} from "./urlData";

export class PuppeteerResult {
    urlData: UrlData;
    numTransferred: number;
    encodedBodySize: number;
    decodedBodySize: number;
    transferSize: number;
    resourcesList: Array<string>;


    constructor(urlData: UrlData, numTransferred: number, encodedBodySize: number, decodedBodySize: number, transferSize: number, resourcesList: Array<string>) {
        this.urlData = urlData;
        this.numTransferred = numTransferred;
        this.encodedBodySize = encodedBodySize;
        this.decodedBodySize = decodedBodySize;
        this.transferSize = transferSize;
        this.resourcesList = resourcesList;
    }

}