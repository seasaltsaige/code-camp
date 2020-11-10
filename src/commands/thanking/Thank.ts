import { Message, TextChannel } from "discord.js";
import Thanks from "../../database/models/Thanks";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import ms from "parse-ms";

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

    public async run(client: BaseClient, message: Message, args: string[]) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("Please mention someone to thank!");
        if (member.id === message.author.id) return message.channel.send("You can't thank yourself.");
        if (member.user.bot) return message.channel.send("You can't thank bots.");

        if ((<TextChannel>message.channel).parent.id !== "773600815670755328") return message.channel.send(`You can't thank people outside of the ${message.guild.channels.cache.get("773600815670755328").name} category.`);


        const timeout = 1000 * 60 * 60 * 3;

        let authorThank = await Thanks.findOne({ uId: message.author.id });
        if (!authorThank) authorThank = await Thanks.create({ uId: message.author.id });

        let memberThank = await Thanks.findOne({ uId: member.id });
        if (!memberThank) memberThank = await Thanks.create({ uId: member.id });

        const time = ms(timeout - (Date.now() - authorThank.cooldown));
        const sayTime = `${time.hours ? `${time.hours}h ` : ""}${time.minutes ? `${time.minutes}m ` : ""}${time.seconds ? `${time.seconds}s ` : ""}`;

        if (authorThank.cooldown > 0 && timeout - (Date.now() - authorThank.cooldown) > 0) return message.channel.send(`You are on cooldown, ${sayTime}`);
        else {

            memberThank.thanks++;
            authorThank.cooldown = Date.now();

            try {
                await memberThank.updateOne(memberThank);
                await authorThank.updateOne(authorThank);
            } catch (err) {
                return message.channel.send("Something went wrong while trying to update the database.");
            }
            return message.channel.send(`${message.author}, you thanked ${member.user.tag}, they now have ${memberThank.thanks} thanks.`);
        }
    }
}