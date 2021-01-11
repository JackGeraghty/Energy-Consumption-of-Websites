"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIType = exports.loadAPIKey = void 0;
var fs = require('fs');
var APIType;
(function (APIType) {
    APIType["PAGESPEED"] = "resources/pagespeed_api_key.txt";
    APIType["LIGHTHOUSE"] = "resources/pagespeed_api_key.txt";
})(APIType || (APIType = {}));
exports.APIType = APIType;
/**
 * Function to loading API keys used within the project, e.g. for PageSpeed API etc
 * @param api Each API type should have an enum declared for it with the associated path to the API key.
 */
function loadAPIKey(api) {
    return fs.readFileSync(api, 'utf-8', function (err, data) {
        if (err) {
            console.error("Ensure that the file containing the API exists!");
            throw err;
        }
        return data;
    });
}
exports.loadAPIKey = loadAPIKey;
