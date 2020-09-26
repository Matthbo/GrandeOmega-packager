const chalk = require("chalk"),
    fetch = require("node-fetch"),
    electronBuilder = require("electron-builder"),
    platform = electronBuilder.Platform,
    fsPromises = require("fs").promises,
    path = require("path"),
    util = require("util")

module.exports = class GO {
    constructor(baseLocation, patcherLocation, buildLocation){
        this.baseLocation = path.normalize(baseLocation)
        this.patcherLocation = path.normalize(patcherLocation),
        this.buildLocation = path.normalize(buildLocation)
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
        
        await exec("npm i -s", { cwd: this.baseLocation }).then(() => 
            console.log(chalk.greenBright("  Done"))
        ).catch(error => 
            console.error(chalk.redBright(`Failed to install dependencies:\n${error.stack}`))
        )
    }

    async patch(){
        console.log(chalk.blueBright("Patching files"))

        const mappings = JSON.parse(await fsPromises.readFile(this.patcherLocation + '/mapping.json')),
            patchesLocation = path.normalize(this.patcherLocation + "/patches/")

        for (const patchFileLocation in mappings){
            const sourceFileLocation = mappings[patchFileLocation],
                patchFile = await fsPromises.readFile(patchesLocation + patchFileLocation)

            await fsPromises.writeFile(this.baseLocation + `/${sourceFileLocation}`, patchFile)
        }
    }

    async build(){
        console.log(chalk.blueBright("Building packages"))

        const builder = new Builder(this.buildLocation, {
            appId: "com.electron.grande-omega",
            productName: "Grande Omega",
            directories: {
                app: this.baseLocation,
                output: this.buildLocation + "/${os}"
            }            
        })

        await builder.buildWin({
            win: {
                target: "msi"
            }
        })
        // await builder.buildMac({
        //     /* TODO */
        // })
        // await builder.buildLinux({
        //     linux: {
        //         target: "deb"
        //     }
        // })

        console.log(chalk.greenBright("  Done"))
    }
}

class Builder {
    constructor(baseLocation, baseConfig){
        this.winLocation = path.normalize(baseLocation + "/win")
        this.macLocation = path.normalize(baseLocation + "/mac")
        this.linuxLocation = path.normalize(baseLocation + "/linux")
        this.baseConfig = baseConfig
    }

    async _getConfig(addCfg){
            const cfg = {...this.baseConfig}
    
            for(const cfgEntry in addCfg){
                cfg[cfgEntry] = addCfg[cfgEntry]
            }

            return cfg
    }

    async buildWin(addCfg){
        console.log(chalk.blueBright("  Windows"))
        const config = await this._getConfig(addCfg)

        await electronBuilder.build({ 
            targets: platform.WINDOWS.createTarget(),
            config: config
         }).catch(error => console.log(chalk.redBright(`  Failed:\n${error}`)))
    }

    async buildMac(config) {
        console.log(chalk.blueBright("  MacOS"))
        config = await this._getConfig(config)

    }

    async buildLinux(config) {
        console.log(chalk.blueBright("  Linux"))
        config = await this._getConfig(config)

        await electronBuilder.build({
            targets: platform.LINUX.createTarget(),
            config: config
        }).catch(error => console.log(chalk.redBright(`  Failed:\n${error}`)))
    }
}

