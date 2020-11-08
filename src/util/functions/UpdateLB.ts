import { Message, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import Thanks from "../../database/models/Thanks";

export default async function updateLB(message: Message) {
    const guild = await Guild.findOne({ gId: message.guild.id });

    const channel = <TextChannel>message.guild.channels.cache.get(guild.thankLB.cId);
    const msg = await channel.messages.fetch(guild.thankLB.mId);

    const lbData = await Thanks.find();
    const sorted = lbData.sort((a, b) => b.thanks - a.thanks).slice(0, 10);

    await msg.edit(`${sorted.map((thank, i) => `#${i + 1} - ${message.guild.members.cache.get(thank.uId)} with ${thank.thanks} thank(s)`).join("\n")}\n\nNext Update in: 60s`)

}