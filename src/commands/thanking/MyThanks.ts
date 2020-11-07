import { Message } from "discord.js";
import Thanks from "../../database/models/Thanks";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class MyThanks extends BaseCommand {
    constructor() {
        super({
            category: "thanking",
            description: "Check your thanks!",
            name: "mythanks",
            permissions: ["SEND_MESSAGES"],
            usage: "mythanks",
            aliases: ["thanks"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let myThanks = await Thanks.findOne({ uId: message.author.id });
        if (!myThanks) myThanks = await Thanks.create({ uId: message.author.id });
        const thanks = myThanks.thanks;
        return message.reply(`You have ${thanks === 1 ? `${thanks} thank` : `${thanks} thanks`}.`);
    }
}