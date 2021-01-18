export class UrlData {
    webpageName: string;
    url: string;
    filename: string;

    constructor(webpageName: string, url: string, postfix: string, fileExt: string) {
        this.webpageName = webpageName;
        this.url = url;
        this.filename = webpageName.concat(postfix);
    }
}