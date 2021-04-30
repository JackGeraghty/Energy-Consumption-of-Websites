import {UrlData} from "../model/urlData";

export function preprocessDesktopUrls(urls: Array<string>): Array<UrlData> {
    let urlData: Array<UrlData> = [];
    urls.forEach(url => {
        // extract a website name, not perfect but works for most sites
        // example of not working perfectly would be www.news.google.ie resulting in just "news"
        let name = (url.replace(/.+\/\/|www.|\..+/g, ''));

        // For the purpose of the experiment google sites were excluded as they caused some issues with PageSpeed
        if (!name.includes("google")) {
            let data:UrlData = new UrlData(name, "http://www.".concat(url), url);
            console.log(data);
            urlData.push(data);
        } else {
            console.log("Skipped a google site");
        }
    });
    return urlData;
}