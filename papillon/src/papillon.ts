import {PapillonResult} from "../../common/model/papillonResult";
import {UrlData} from "../../common/model/urlData";

const request = require('request-promise-native');

export class Papillon {
    datacenterID: string;
    floorID: string;
    rackID: string;
    hostID: string;
    isMobile: boolean;

    constructor(datacenterID: string, floorID: string, rackID: string, hostID: string, isMobile: boolean) {
        this.datacenterID = datacenterID;
        this.floorID = floorID;
        this.rackID = rackID;
        this.hostID = hostID;
        this.isMobile = isMobile;
    }

    async query(urlData: UrlData, startTime: number): Promise<PapillonResult> {
        const endTime = startTime + 61;
        const activityQuery = `datacenters/${this.datacenterID}/floors/${(this.floorID)}/racks/${(this.rackID)}/hosts/${(this.hostID)}/activity?starttime=${startTime}&endtime=${endTime}`;

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
            const activityResponse = await request(getOptions(activityQuery), (err: any, req: any, body: any) => {
                if (err) console.log(err);
                console.log(body);
            });
            let result: PapillonResult;
            console.log("Activity Response: " + activityResponse != null);
            if (activityResponse != null) {
                console.log("Received response");
                let power: number = 0.0;
                let network: number = 0.0;
                let memory: number = 0.0;

                let powerSeries: Array<[number, number]> = [];
                let networkSeries: Array<[number, number]> = [];
                let memorySeries: Array<[number, number]> = [];

                for (const response of activityResponse.activity) {
                    power += +response.power;
                    network += +response.stat2;
                    memory += +response.stat3;
                    powerSeries.push([+response.power, +response.timestamp]);
                    networkSeries.push([+response.stat2, +response.timestamp]);
                    memorySeries.push([+response.stat3, +response.timestamp]);
                }
                result = new PapillonResult(urlData, power, network, memory, powerSeries, networkSeries, memorySeries, this.isMobile);
                console.log(JSON.stringify(result, null, 2));
                return result;
            }

        } catch (ex) {
            console.log(ex);
        }
        return null;
    }
}