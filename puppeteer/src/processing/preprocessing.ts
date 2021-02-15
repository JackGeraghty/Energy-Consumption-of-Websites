import {UrlData} from "../../../common/model/urlData";

export function preprocessDesktopUrls(urls: Array<string>): Array<UrlData> {
    let urlData: Array<UrlData> = [];
    urls.forEach(url => {
        let name = (url.replace(/.+\/\/|www.|\..+/g, ''));
        if (!name.includes("google")) {
            urlData.push(new UrlData(name, "http://".concat(url)));
        } else {
            console.log("Skipped a google site");
        }
    });
    return urlData;
}