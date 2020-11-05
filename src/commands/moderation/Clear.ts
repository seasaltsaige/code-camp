import { Message, NewsChannel, TextChannel } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Clear extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Clear up to 100 messages from a channel",
            name: "clear",
            permissions: ["MANAGE_MESSAGES"],
            usage: "clear <amount>",
            aliases: ["purge"],
        });
    }

    public async run (client: BaseClient, message: Message, args: string[]) {
        const deleteCount = args[0];

        if (!deleteCount) return message.channel.send("Please provide a number of messages to delete.");
        if (isNaN(parseInt(deleteCount))) return message.channel.send("Please provide a **number** of messages to delete.");
        if (parseInt(deleteCount) > 100 || parseInt(deleteCount) < 2) return message.channel.send("Please provide a number greater than 2 and less than 101.");

        const messages = await message.channel.messages.fetch({ limit: parseInt(deleteCount) })
        await (<TextChannel | NewsChannel>message.channel).bulkDelete(messages, true);

        return message.channel.send(`Successfully cleared ${deleteCount} messages.`).then(m => m.delete({ timeout: 5000 }));

    }
}