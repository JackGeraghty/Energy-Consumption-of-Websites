const fs = require('fs');

enum APIType {
    PAGESPEED = "resources/pagespeed_api_key.txt",
    LIGHTHOUSE = "resources/pagespeed_api_key.txt"
}

/**
 * Function to loading API keys used within the project, e.g. for PageSpeed API etc
 * @param api Each API type should have an enum declared for it with the associated path to the API key.
 */
function loadAPIKey(api: APIType): Promise<string>{
    return fs.readFileSync(api, 'utf-8', function(err:Error, data: string){
        if (err) {
            console.error("Ensure that the file containing the API exists!");
            throw err;
        }
        return data;
    });
}

export {
    loadAPIKey,
    APIType
}