import {UrlData} from "../model/urlData";

export function preprocessDesktopUrls(urls: Array<string>): Array<UrlData> {
    let urlData: Array<UrlData> = [];
    urls.forEach(url => {
        let name = (url.replace(/.+\/\/|www.|\..+/g, ''));
        console.log(name);
        urlData.push(new UrlData(name, url));
    })

    return urlData;
}