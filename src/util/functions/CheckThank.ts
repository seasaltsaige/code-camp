import { Message, TextChannel } from "discord.js";
const Thankings = ["thanks", "thank", "thx", "thnx", "thank you", "ty", "tysm", "thx"];

export default function checkThank(message: Message) {
    const args = message.content.split(" ");

    for (const arg of args) {
        if (Thankings.includes(arg) && (<TextChannel>message.channel).parent.id === "773600815670755328") return `Hey, ${message.author}, consider thanking them with \`?thank <User>\``;
    }
}