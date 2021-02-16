import {PapillonResult} from "../../common/model/papillon/papillonResult";
import {UrlData} from "../../common/model/urlData";

const request = require('request-promise-native');

export class Papillon {


    async queryPapillon(urlData: UrlData, datacenterID: string, floorID: string,
                        rackID: string, hostID: string,
                        startTime: number, endTime: number): Promise<PapillonResult> {
        const query = `datacenters/${datacenterID}/floors/${floorID}/racks/${rackID}/hosts/${hostID}/activity?starttime=${startTime}&endtime=${endTime}`;
        let options = {
            uri: "http://localhost:8080/PapillonServer/rest/".concat(query),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json: true
        }
        let response = await request(options);
        let power: number = response.activity.power;
        let memory: number = response.activity.stat2;
        let network: number = response.activity.stat3;

        return new PapillonResult(urlData, power, memory, network);
    }
}