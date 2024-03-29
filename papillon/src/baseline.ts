import {delay, writeToFile} from "../../common/util/utils";
import {Papillon} from "./papillon";

const yargs = require('yargs');
const fs = require('fs');
const args = yargs.argv;

if (!args.browserName) {
    console.warn("No browser name given, please provide one to program arguments.")
    process.exit(-1);
}

main().then(() => {
    console.log("Finished running baseline measure");
    process.exit(0);
});

async function main() {
    const browserName = args.browserName;

    if (!fs.existsSync("results/")) fs.mkdirSync("results/");
    if (!fs.existsSync("results/baselines/")) fs.mkdirSync("results/baselines/");

    console.log(`Starting baseline measurement for ${browserName}`);
    const sTime = Math.floor(Date.now() / 1000);
    console.log(`Start time: ${sTime}`)
    console.log('Allowing for 10 minute measurement period');
    const papillon: Papillon = new Papillon("267", "291", "294", "284", false);
    for (let i = 0; i < 10; i++) {
        await delay(60000);
        console.log(`Time Passed: ${(i + 1) * 60000} - Time Remaining: ${10 * 60000 - (i + 1) * 60000}`);
    }
    console.log("Querying Papillon");

    let result: string = await papillon.query(sTime);
    if (!result) {
        console.error(`Failed to get result from Papillon query for ${browserName}.`);
        process.exit(-1);
    }
    writeToFile("results/baselines/", `${browserName}.json`, result)
        .then(() => console.log(`Finished writing data for ${browserName} to results/baselines/`));
}