import { Message } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Softban extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Ban, then immediately unban someone",
            name: "softban",
            permissions: ["BAN_MEMBERS"],
            usage: "softban <user> [reason]",
            aliases: ["sban"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {

    }
}