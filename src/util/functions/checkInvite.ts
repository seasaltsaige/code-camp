import { Message } from "discord.js";
const regex = /((discord\.(gg|io|me|li))|discordapp.com\/invite)\/+[a-zA-Z0-9]{2,16}/gi;

export default function checkInvite(message: Message) {

    // console.log(regex.test(message.content));

    const test = regex.test(message.content)

    if (test) message.delete().then(() => message.channel.send(`Hey ${message.author}, please don't send invite links.`));

}