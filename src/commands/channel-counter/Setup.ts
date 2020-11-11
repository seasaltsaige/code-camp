import { Message } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class CSetup extends BaseCommand {
    constructor() {
        super({
            category: "channel-counter",
            description: "Setup channel counters for server stats.",
            name: "csetup",
            permissions: ["ADMINISTRATOR"],
            usage: "csetup",
            aliases: ["countersetup", "ccsetup"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {

    }
}