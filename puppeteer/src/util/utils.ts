const fs = require('fs');

export enum APIType {
    PAGESPEED = "resources/pagespeed_api_key_new.txt"
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