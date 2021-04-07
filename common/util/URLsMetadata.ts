export class URLsMetadata {
    pathToUrlsFile: string;
    data: Array<string>;
    pathToCompleted: string;
    completedData: Array<string>;
    pathToFailed: string;
    failedData : Array<string>;

    constructor( pathToUrlsFile: string, data: Array<string>, pathToCompleted: string, completedData: Array<string>, pathToFailed: string, failedData: Array<string>) {
        this.pathToUrlsFile = pathToUrlsFile;
        this.data = data;
        this.pathToCompleted = pathToCompleted;
        this.completedData = completedData;
        this.pathToFailed = pathToFailed;
        this.failedData = failedData;
    }
}