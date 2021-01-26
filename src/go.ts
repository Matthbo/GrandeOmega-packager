import chalk from "chalk";
import fetch from "node-fetch";
import electronBuilder, { Platform } from "electron-builder";
import { promises as fsPromises } from "fs";
import path from "path";

export class GO {
    private baseLocation: string;
    private buildLocation: string;
    private resourcesLocation: string;

    constructor(baseLocation: string, buildLocation: string, resourcesLocation: string){
        this.baseLocation = path.normalize(baseLocation);
        this.buildLocation = path.normalize(buildLocation);
        this.resourcesLocation = path.normalize(resourcesLocation);
    }

    async checkVersion(url: string){
        console.log(chalk.blueBright("Checking for newer Grande Omega version"));

        const res = await fetch(url),
            onlineVersion = await res.text(),
            offlineVersion = await fsPromises.readFile(this.baseLocation + "/version.txt", { encoding: 'utf8' }).catch(error => {
                if (error.code !== "ENOENT")
                    throw error;
                else
                    return "0";
            });

        return offlineVersion !== onlineVersion;
    }

    async build(){
        console.log(chalk.blueBright("Building packages"));

        const builder = new Builder(this.buildLocation, {
            appId: "com.electron.grande-omega",
            productName: "Grande Omega",
            directories: {
                app: this.baseLocation,
                output: this.buildLocation + "/${os}",
                // buildResources: this.resourcesLocation + "/icons/icon.*"
            }            
        });

        await builder.buildWin({
            win: {
                target: "msi",
                icon: this.resourcesLocation + "/icons/icon.png"
            }
        });
        // await builder.buildMac({
        //     /* TODO */
        // });
        // await builder.buildLinux({
        //     linux: {
        //         target: "deb"
        //     }
        // });

        console.log(chalk.greenBright("  Done"));
    }
}

class Builder {
    private winLocation: string;
    private macLocation: string;
    private linuxLocation: string;
    private baseConfig: { [index: string]: any; };

    constructor(baseLocation: string, baseConfig: { [index: string]: any; }){
        this.winLocation = path.normalize(baseLocation + "/win");
        this.macLocation = path.normalize(baseLocation + "/mac");
        this.linuxLocation = path.normalize(baseLocation + "/linux");
        this.baseConfig = baseConfig;
    }

    async _getConfig(addCfg: { [index: string]: any }){
            const cfg = {...this.baseConfig};
    
            for(const cfgEntry in addCfg){
                cfg[cfgEntry] = addCfg[cfgEntry];
            }

            return cfg;
    }

    async buildWin(addCfg: { [index: string]: any }){
        console.log(chalk.blueBright("  Windows"));
        const config = await this._getConfig(addCfg);

        await electronBuilder.build({ 
            targets: Platform.WINDOWS.createTarget(),
            config: config
         }).catch(error => console.log(chalk.redBright(`  Failed:\n${error}`)));
    }

    async buildMac(config: { [index: string]: any }) {
        console.log(chalk.blueBright("  MacOS"));
        config = await this._getConfig(config);

    }

    async buildLinux(config: { [index: string]: any }) {
        console.log(chalk.blueBright("  Linux"));
        config = await this._getConfig(config);

        await electronBuilder.build({
            targets: Platform.LINUX.createTarget(),
            config: config
        }).catch(error => console.log(chalk.redBright(`  Failed:\n${error}`)));
    }
}

