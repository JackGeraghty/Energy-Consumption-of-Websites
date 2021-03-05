import {PapillonResult} from "../../common/model/papillonResult";
import {UrlData} from "../../common/model/urlData";
import {replacer} from "../../common/util/utils";

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

    async query(urlData: UrlData, startTime: number): Promise<string> {
        const endTime = startTime + 65;
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
            await request(getOptions(activityQuery), (err: any, req: any, body: any) => {
                if (err) {
                    console.log(`Error: ${err}`);
                    return null;
                }
                let result: PapillonResult;
                console.log(body);
                console.log("Received response");
                return body;
            });
        } catch (ex) {
            console.log(ex);
        }
        console.log("Returning null");
        return null;
    }
}