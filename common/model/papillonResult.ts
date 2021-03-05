import {ExperimentResult} from "./interfaces/experimentResult";
import {UrlData} from "./urlData";

export class PapillonResult implements ExperimentResult {
    urlData: UrlData;
    response: string;
    isMobile: boolean

    constructor(urlData: UrlData, response: string, isMobile: boolean) {
        this.urlData = urlData;
        this.response = response;
        this.isMobile = isMobile;
    }
}