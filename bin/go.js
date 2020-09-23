const chalk = require("chalk")

const fetch = require("node-fetch"),
    fs = require("fs"),
    fsPromises = fs.promises,
    path = require("path"),
    util = require("util")

module.exports = class GO {
    constructor(baseLocation){
        this.baseLocation = path.normalize(baseLocation)
    }

    async checkVersion(url){
        console.log(chalk.blueBright("Checking for newer Grande Omega version"))

        const res = await fetch(url),
            onlineVersion = await res.text(),
            offlineVersion = await fsPromises.readFile(this.baseLocation + "/version.txt", { encoding: 'utf8' }).catch(error => {
                if (!error.code === "ENOENT")
                    throw error
                else
                    return "0"
            })

        return offlineVersion !== onlineVersion
    }

    async installDependencies(){
        console.log(chalk.blueBright("Installing dependencies via npm"))

        const exec = util.promisify(require('child_process').exec)
        
        await exec("npm i", { cwd: this.baseLocation }).then((stdout, stderr) => {
            console.log('stdout:', stdout)
            console.error('stderr:', stderr)
        }).catch(error => console.error(chalk.redBright(`Failed to install dependencies:\n${error.stack}`)))
    }

    async patch(){

    }
}