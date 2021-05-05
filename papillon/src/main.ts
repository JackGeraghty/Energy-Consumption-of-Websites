import {delay, writeToFile} from "../../common/util/utils";
import {Papillon} from "./papillon";
import * as fs from "fs";

const yargs = require("yargs");

console.log("     __   ________________ _       __   __\n" +
    "    / /  / ____/ ____/ __ \\ |     / /  / /\n" +
    "   / /  / __/ / /   / / / / | /| / /  / / \n" +
    "  / /  / /___/ /___/ /_/ /| |/ |/ /  / /  \n" +
    " / /  /_____/\\____/\\____/ |__/|__/  / /   \n" +
    "/_/                                /_/    \n");

const args = yargs.argv;

if (!args.webpageName) {
    console.warn("No webpage name given, exiting");
    console.log("Usage: node/nodejs build/papillon/src/main.js --webpageName={webpage name} --category={category}");
    process.exit(-1);
}

if (!args.category) {
    console.warn("No category given, exiting");
    console.log("Usage: node/nodejs build/papillon/src/main.js --webpageName={webpage name} --category={category}")
    process.exit(-1);
}

main().then(() => {
    console.log(`Finished running experiment for ${args.webpageName}`);
});

async function main() {
    // Create the necessary directories
    if (!fs.existsSync("results/")) fs.mkdirSync("results/");
    if (!fs.existsSync(`results/${args.category}`)) fs.mkdirSync(`results/${args.category}`);
    // parameters passed to the Papillon constructor are taken from the Papillon UI.
    const papillon: Papillon = new Papillon("267", "291", "294", "284", false);

    console.log(`Starting measurement for ${args.webpageName}`);

    const sTime = Math.floor(Date.now() / 1000) - 10;

    console.log(`Start time: ${sTime}`)
    console.log('Allowing for 10 minute measurement period');

    for (let i = 0; i < 10; i++) {
        await delay(60000);
        console.log(`Time Passed: ${i + 1} minutes - Time Remaining: ${10 - (i + 1)} minutes`);
    }

    console.log("Querying Papillon");
    let result: string = await papillon.query(sTime);
    if (!result) {
        console.error(`Failed to get result from Papillon query for ${args.webpageName}`);
        process.exit(-1);
    }

    writeToFile(`results/${args.category}/`, `${args.webpageName}.json`, result)
        .then(() => console.log(`Finished writing data for ${args.webpageName}`));
    console.log("Finished taking data, shutting down");
}