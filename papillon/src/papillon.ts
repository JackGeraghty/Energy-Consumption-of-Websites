import {PapillonResult} from "../../common/model/papillonResult";
import {UrlData} from "../../common/model/urlData";

const request = require('request-promise-native');

export class Papillon {

    datacenterID: string;
    floorID: string;
    rackID: string;
    hostID: string;


    constructor(datacenterID: string, floorID: string, rackID: string, hostID: string) {
        this.datacenterID = datacenterID;
        this.floorID = floorID;
        this.rackID = rackID;
        this.hostID = hostID;
    }

    async query(urlData: UrlData, startTime: number): Promise<PapillonResult> {
        let sTime = Math.floor(startTime / 1000);
        let eTime = sTime + 61;
        const query = `datacenters/${this.datacenterID}/floors/${(this.floorID)}/racks/${(this.rackID)}/hosts/${(this.hostID)}/activity?starttime=${sTime}&endtime=${eTime}`;
        let options = {
            uri: "http://localhost:8080/papillonserver/rest/".concat(query),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json: true
        }
        try {
            let response = await request(options);

            return new PapillonResult(urlData, response);
        } catch (ex) {
            console.log(ex);
        }
        return null;
    }
}