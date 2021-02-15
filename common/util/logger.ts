const fs = require('fs');

export class Logger {
    logFile: string;

    constructor(logFile: string) {
        this.logFile = logFile;
    }

    log(message: string): void {
        fs.writeFileSync(this.logFile, message.concat("\n"), {
            encoding: 'utf-8',
            flag: 'a+'
        }, function (err: Error) {
            if (err) throw err;
        });
    }

}