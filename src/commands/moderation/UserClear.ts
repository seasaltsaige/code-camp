import { Message, NewsChannel, TextChannel } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import sleep from "../../util/functions/Sleep";

export default class UserClear extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Clear messages from a specified user.",
            name: "userclear",
            permissions: ["MANAGE_MESSAGES"],
            usage: "userclear <user> <delCount>",
            aliases: ["userpurge", "uclear", "upurge"],
        });
    }
    public async run (client: BaseClient, message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("Please mention / provide a MemberID to clear messages from.");

        const deleteCount = args[1];

        if (!deleteCount) return message.channel.send("Please provide a number of messages to delete.");
        if (isNaN(parseInt(deleteCount))) return message.channel.send("Please provide a **number** of messages to delete.");
        if (parseInt(deleteCount) > 100 || parseInt(deleteCount) < 2) return message.channel.send("Please provide a number greater than 2 and less than 101.");

        const past100 = await message.channel.messages.fetch({ limit: 100 });
        const userMsgs = past100.filter(m => m.author.id === member.id);

        if (userMsgs.size < 1) return message.channel.send("This user hasn't talked in the last 100 messages."); 

        let lastMsgId = past100.last().id;
        let lastSize = userMsgs.size;

        message.channel.send("This can take some time...").then(m => m.delete({ timeout: 5000 }));

        while (userMsgs.size < parseInt(deleteCount)) {

            const older = await message.channel.messages.fetch({ limit: 100, after: lastMsgId });
            lastMsgId = older.last().id;

            const olderUserMsgs = older.filter(m => m.author.id === member.id);
            for (const [key, msg] of olderUserMsgs) {
                userMsgs.set(key, msg);
            }

            if (lastSize === userMsgs.size) break;

            lastSize = userMsgs.size;

            await sleep(5000);
        }

        const toDelete = userMsgs.array().slice(0, parseInt(deleteCount));
        await (<TextChannel | NewsChannel>message.channel).bulkDelete(toDelete, true);

        return message.channel.send(parseInt(deleteCount) === toDelete.length ? `Successfully deleted ${deleteCount} messages from ${member.user.username}` : `I was only able to delete ${toDelete.length} messages from ${member.user.username}`).then(m => m.delete({ timeout: 5000 }));

    }
}