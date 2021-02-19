export class UrlData {
    webpageName: string;
    url: string;
    originalURL: string
    constructor(webpageName: string, url: string, originalURL: string) {
        this.webpageName = webpageName;
        this.url = url;
        this.originalURL = originalURL;
    }
}