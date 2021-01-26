import chalk from "chalk";
import { patcher, Downloader } from "grandeomega-patcher";
import { GO } from "./go";

async function main() {
    try {
        const dl = new Downloader(__dirname + "/../tmp", __dirname + "/../GO"),
            go = new GO(__dirname + "/../GO", __dirname + "/../dist", __dirname + "/../resources");

        const needsDownload = await go.checkVersion("http://grandeomega.com/api/v1/CustomAssignmentLogic/version");

        if(needsDownload){    
            await dl.downloadFile("http://www.grandeomega.com/downloads/go_student_mac.zip");

            console.log(chalk.blueBright("Unzipping Grande Omega"))
            await Downloader.cleanUp(__dirname + "/../GO", error => { console.error(`Couldn't delete GO:\n${error.stack}`) });
            dl.unzipFile();
        }

        await patcher(__dirname + "/../GO");
        await go.build();

        console.log(chalk.blueBright("Cleaning up"));
        await Downloader.cleanUp(__dirname + "/../tmp");

        console.log(chalk.blueBright("Finished"));
    } catch(error){
        console.error(chalk.redBright(`Failed to package Grande Omega!\n${error.stack}`));
        await Downloader.cleanUp(__dirname + "/../tmp");
    }
}

main();