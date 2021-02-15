import {LOG_PATH} from "./constants";

const fs = require('fs');

export enum APIType {
    PAGESPEED = "resources/apis/pagespeed_api_key.txt"
}

export function initializeDirs() {
    const fs = require('fs');
    if (!fs.existsSync("results/")) {
        fs.mkdirSync("results/");
        console.log("Had to create results directory");
    } else {
        console.log("Results directory found");
    }
    if (!fs.existsSync(LOG_PATH)) {
        console.log("Creating log dir");
        fs.mkdirSync(LOG_PATH.concat("\\puppeteer"), {recursive: true});
        fs.mkdirSync(LOG_PATH.concat("\\pagespeed"), {recursive: true});
    }
}

/**
 * Function to loading API keys used within the project, e.g. for PageSpeed API etc
 * @param api Each API type should have an enum declared for it with the associated path to the API key.
 */
export function loadAPIKey(api: APIType): string {
    return fs.readFileSync(api, 'utf-8', function (err: Error, data: string) {
        if (err) {
            console.error("Ensure that the file containing the API exists!");
            throw err;
        }
        return data;
    });
}

export function loadFileAsJson(path: string): any {
    return JSON.parse(loadFile(path));
}

export function loadFile(path: string): string {
    return fs.readFileSync(path, 'utf-8', function (err: Error, data: string) {
        if (err) {
            console.error("Unable to open file : " + path);
            throw err;
        }
        return data;
    }).toString();
}

export async function writeToFle(path: string, fileName: string, data: any): Promise<void> {
    fs.mkdirSync(path, {recursive: true});
    fs.writeFile(path.concat(fileName), JSON.stringify(data, replacer, 2), {
        encoding: 'utf-8',
        flag: 'w'
    }, function (err: Error) {
        if (err) throw err;
    });
}

export function replacer(this: any, key: any, value: any) {
    const originalObject = this[key];
    if (originalObject instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
        };
    } else {
        return value;
    }
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function millisToMinutesAndSeconds(milliseconds:number): string {
    let seconds = (milliseconds / 1000) % 60 ;
    let minutes = ((milliseconds / (1000*60)) % 60);
    let hours   = ((milliseconds / (1000*60*60)) % 24);
    return `${Math.round(hours)}:${Math.round(minutes)}:${seconds}`;
}
