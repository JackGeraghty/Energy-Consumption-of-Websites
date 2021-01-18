import {UrlData} from "../model/urlData";
import {DESKTOP_RESULTS} from "../util/constants";

export function preprocessDesktopUrls(urls: Array<string>): Array<UrlData> {
    let urlData: Array<UrlData> = [];
    for (let i = 0; i < urls.length; i++) {
        let url: string = urls[i].replace("/\\r?\\n|\\r/g", "");
        let name = url.substring("https://".length).split(".")[0];
        urlData.push(new UrlData(name, url, DESKTOP_RESULTS, ".json"));
    }
    return urlData;
}