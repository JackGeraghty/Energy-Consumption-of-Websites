import {PuppeteerResult} from "../model/puppeteerResults";

export async function postProcessPuppeteer(results: Array<PuppeteerResult>): Promise<PuppeteerResult> {
    return results[0];
}