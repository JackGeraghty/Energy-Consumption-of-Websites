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
        const sTime = Math.floor(startTime / 1000);
        const eTime = sTime + 61;
        const activityQuery = `datacenters/${this.datacenterID}/floors/${(this.floorID)}/racks/${(this.rackID)}/hosts/${(this.hostID)}/activity?starttime=${sTime}&endtime=${eTime}`;

        const getOptions = (query: string) => {
            return {
                uri: "http://localhost:8080/papillonserver/rest/".concat(query),
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json: true
            }
        };

        try {
            const activityResponse = await request(getOptions(activityQuery), (err: Error, req: any, body: any) => {
                if (err) console.log(err);
            });
            let result: PapillonResult;
            if (activityResponse != null) {
                let power = 0.0;
                let network = 0.0;
                let memory = 0.0;
                for (const response of activityResponse.activity) {
                    power += +response.power;
                    network += +response.stat2;
                    memory += +response.stat3;
                }
                result = new PapillonResult(urlData, power, network, memory);
                console.log(JSON.stringify(result, null, 2));
            }


            if (result) {
                console.log("--ACTIVITY--");
                console.log(JSON.stringify(result, null, 2));
                return result;
            } else {
                console.log("Missing a query response");
                console.log(`Activity: ${result != null}`);
            }

        } catch (ex) {
            console.log(ex);
        }
        return null;
    }
}