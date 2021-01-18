import {UrlData} from "./model/urlData";
import {writeToFle} from "./util/fileUtils";

let PAGESPEED = "results/pagespeed/";

export async function runPageSpeed(urlData: Array<UrlData>, strategy: string) {
    if (strategy !== "DESKTOP" && strategy !== "MOBILE") {
        throw new Error("Invalid strategy passed");
    }
    for (let i = 0; i < urlData.length; i++) {
        let url = urlData[i];
        queryPageSpeed(url.url, "DESKTOP").then((result) => {
            writeToFle(PAGESPEED.concat(url.webpageName).concat("/"), url.filename, result)
        });
    }
}

export async function queryPageSpeed(url: string, strategy: string) {
    const query = getRequestFromTemplate(url, strategy.toString());
    /**
     * Do actual pagespeed stuff
     */
    return query;
}

export function getRequestFromTemplate(url: string, strategy: string): string {
    const query: PageSpeedQuery = new PageSpeedQuery(url, strategy);
    return JSON.stringify(query, null, 2);
}

class PageSpeedQuery {
    url: string;
    strategy: string;
    categories: Array<string> = ["ACCESSIBILITY", "BEST_PRACTICES", "PERFORMANCE", "PWA", "SEO"];

    constructor(url: string, strategy: string) {
        this.url = url;
        this.strategy = strategy;
    }
}