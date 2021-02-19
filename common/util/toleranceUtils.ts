import {COMPLETED_URLS_PATH, FAILED_URLS_PATH, URLS_PATH} from "./constants";
import {loadFileAsJson} from "./utils";
const fs = require('fs');

export function loadURLS(): [Array<string>, Array<string>, Array<string>] {
    if (!fs.existsSync(COMPLETED_URLS_PATH)) {
        fs.writeFileSync(COMPLETED_URLS_PATH, "[]", (err: Error) => {
            if (err) console.error(err);
        });
    }
    let completeURLs: Array<string> = loadFileAsJson(COMPLETED_URLS_PATH);
    if (!fs.existsSync(FAILED_URLS_PATH)) {
        fs.writeFileSync(FAILED_URLS_PATH, "[]", (err: Error) => {
            if (err) console.error(err);
        });
    }
    let failedURLs: Array<string> = loadFileAsJson(FAILED_URLS_PATH);

    const fullUrls: Array<string> = loadFileAsJson(URLS_PATH);

    if (failedURLs.length == 0 && completeURLs.length == 0) {
        console.log("No failed or completed urls, returning full set of urls");
        return [fullUrls, [], []];
    }

    return [urlDiff(fullUrls, completeURLs, failedURLs), completeURLs, failedURLs];
}

function urlDiff(fullURLs: Array<string>, completedURLs: Array<string>, failedURLs: Array<string>): Array<string> {
    let todoURLs: Array<string> = [];

    for (const url of fullURLs) {
        if (!(completedURLs.includes(url) || failedURLs.includes(url))) {
            todoURLs.push(url);
        } else {
            console.log(`skipping ${url}`);
        }
    }
    return todoURLs;
}

export function updateFile(urlsAsJson: string, filePath: string) {
    return fs.writeFileSync(filePath, urlsAsJson, {
        encoding: 'utf-8',
        flag: 'w+'
    }, (err: Error) => {
        if (err) throw err;
    });
}