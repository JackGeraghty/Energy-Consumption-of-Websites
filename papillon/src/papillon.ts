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

    async query(urlData: UrlData, startTime: number, endTime: number): Promise<PapillonResult> {
        const query = `datacenters/${this.datacenterID}/floors/${(this.floorID)}/racks/${(this.rackID)}/hosts/${(this.hostID)}/activity?starttime=${startTime}&endtime=${endTime}`;
        let options = {
            uri: "http://localhost:8080/PapillonServer/rest/".concat(query),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json: true
        }
        try {
            let response = await request(options);
            let power: number = response.activity.power;
            let memory: number = response.activity.stat2;
            let network: number = response.activity.stat3;

            return new PapillonResult(urlData, power, memory, network);
        } catch (ex) {
            console.log(ex);
        }
        return null;
    }
}