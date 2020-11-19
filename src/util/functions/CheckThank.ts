import { Message, TextChannel } from "discord.js";
import Thanks from "../../database/models/Thanks";
const Thankings = ["thanks", "thank", "thx", "thnx", "thank you", "ty", "tysm", "thx"];

export default async function checkThank(message: Message) {

    let userOnCooldownProfile = await Thanks.findOne({ uId: message.author.id });
    if (!userOnCooldownProfile) userOnCooldownProfile = await Thanks.create({ uId: message.author.id });

    const timeout = 1000 * 60 * 60 * 3;
    if (timeout - (Date.now() - userOnCooldownProfile.cooldown)) return false;

    const args = message.content.split(" ");

    for (const arg of args) {
        if (Thankings.includes(arg.toLowerCase()) && (<TextChannel>message.channel).parent.id === "773600815670755328") return `Hey, ${message.author}, consider thanking them with \`?thank <User>\``;
    }
}