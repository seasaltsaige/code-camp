import BaseClient from "../util/BaseClient";
import readdir from "readdir-plus";
import BaseCommand from "../util/BaseCommand";


export default new class CommandHandler {
    load(mainPath: string, subPaths: Array<string>, client: BaseClient): void {

        for (const path of subPaths) {
            readdir(`${mainPath}/${path}`, async (err, files) => { 
                if (err) throw err;

                for (const file of files) {
                    // Import the command.
                    const { default: Command } = await import(file.path);

                    const command: BaseCommand = new Command();

                    if (command.BaseCommandInfo.category !== path) throw new ReferenceError("Command category must be the same as file path");

                    // Set the client to use that command.
                    client.baseClient.commands.set(command.BaseCommandInfo.name.toLowerCase(), command);

                    if (command.BaseCommandInfo.aliases) {
                        command.BaseCommandInfo.aliases.forEach((alias: string) => client.baseClient.aliases.set(alias, command.BaseCommandInfo.name.toLowerCase()));
                    }
                }
                console.log(`Successfully loaded ` + `${files.length} ` + "command(s) in the " + path + " category");
            });
        } 
    }
}