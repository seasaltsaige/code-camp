import { Message, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import Thanks from "../../database/models/Thanks";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import updateTimer from "../../util/functions/UpdateTimer";

export default class SetLB extends BaseCommand {
    constructor() {
        super({
            category: "thanking",
            description: "Set the channel in which the thank leaderboard should be shown",
            name: "setlb",
            permissions: ["ADMINISTRATOR"],
            usage: "setlb <channel>",
            aliases: ["setleaderboard", "settlb"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channel) return message.channel.send("Please mention a channel to set the LB to.");
        if (channel.type !== "text") return message.channel.send("Please mention a **text** channel.");

        const curChannel = guild.thankLB;
        if (curChannel && curChannel.cId === channel.id) return message.channel.send("Please mention a **new** channel to set the LB to.");

        if (message.guild.me.permissionsIn(channel).has("SEND_MESSAGES")) {

            const lbData = await Thanks.find();
            if (lbData.length < 1) return message.channel.send("There isn't any data to display on the leaderboard! Get thanking!");

            const sorted = lbData.sort((a, b) => b.thanks - a.thanks);

            const m = await (<TextChannel>channel).send(`${sorted.map((thank, i) => `#${i + 1} - ${message.guild.members.cache.get(thank.uId)} with ${thank.thanks} thank(s)`).join("\n")}\n\nNext Update in: 60s`);

            guild.thankLB = {
                cId: channel.id,
                mId: m.id,
            };

            setInterval(updateTimer, 5000, message);

            try {
                await guild.updateOne(guild);
            } catch (err) {
                return message.channel.send("Something went wrong while updating the database, the message was most likely still sent.");
            }



        } else return message.channel.send("OOP's I can't send messages there.");
    }
}