const fetch = require("node-fetch"),
    admZip = require("adm-zip"),
    chalk = require("chalk"),
    fs = require("fs"),
    fsPromises = fs.promises,
    path = require("path"),
    utils = require("./utils")

module.exports = class Downloader {
    constructor(outDir) {
        this.outDir = outDir
        this.filePath = path.normalize(outDir + "/go.zip")
    }

    async downloadFile(url){
        await utils.TestIfDirExistAndCreateDir(this.outDir)

        const res = await fetch(url),
            file = fs.createWriteStream(this.outDir + "/go.zip"),
            stream = res.body.pipe(file)

        await new Promise(resolve => stream.on("finish", resolve))
        console.log(chalk.greenBright("  Done"))
    }

    unzipFile(){
        const file = admZip(this.filePath),
            fileContents = file.getEntries().filter(content => !content.entryName.startsWith("go_student_mac/node_modules"))

        fileContents.forEach(content => console.log(content.entryName))

        console.log(chalk.greenBright("  Done"))
    }
}