import {writeToFle} from "./util/fileUtils";

async function queryPuppeteer(url: string): Promise<PuppeteerResult> {

}

export async function runPuppeteer(urls: Array<string>) {
    for (let url of urls) {
        queryPuppeteer(url).then((result) => {
            writeToFle();
        });
    }
}

export class PuppeteerResult {

}