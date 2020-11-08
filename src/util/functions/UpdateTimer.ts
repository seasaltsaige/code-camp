import { Message, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import updateLB from "./UpdateLB";

export default async function updateTimer(message: Message) {
    const regex = /Next Update in:\s\d+s/i;
    const guild = await Guild.findOne({ gId: message.guild.id });

    const channel = <TextChannel>message.guild.channels.cache.get(guild.thankLB.cId);
    const msg = await channel.messages.fetch(guild.thankLB.mId);

    const num = parseInt(msg.content.split("\n")[msg.content.split("\n").length - 1].split(" ")[3].replace("s", ""));

    if (num - 5 !== 0) msg.edit(msg.content.replace(regex, `Next Update in: ${num - 5}s`));
    else await updateLB(message);

}