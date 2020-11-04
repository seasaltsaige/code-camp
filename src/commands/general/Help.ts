import { Message } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Help extends BaseCommand {
    constructor() {
        super({
            category: "general",
            description: "Get help with the bot",
            name: "help",
            permissions: ["SEND_MESSAGES"],
            usage: "help [command]",
            aliases: ["halp", "commands"],
        });
    }
    async run (client: BaseClient, message: Message, args: string[]) {
        message.channel.send("Help");
    }
}