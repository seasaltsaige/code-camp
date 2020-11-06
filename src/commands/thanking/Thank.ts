import { Message } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Thank extends BaseCommand {
    constructor() {
        super({
            category: "thanking",
            description: "Thank someone for helping you.",
            name: "thank",
            permissions: ["SEND_MESSAGES"],
            usage: "thank <user>",
        });
    }

    public async run (client: BaseClient, message: Message, args: string[]) {
        
    }
}