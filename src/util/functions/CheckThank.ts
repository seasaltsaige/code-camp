import { Message, TextChannel } from "discord.js";
const Thankings = ["thanks", "thank", "thx", "thnx", "thank you", "ty", "tysm", "thx"];

export default function checkThank(message: Message) {
    for (const Thank of Thankings) {
        if (message.content.toLowerCase().includes(Thank) && (<TextChannel>message.channel).parent.id === "773600815670755328") return `Hey, ${message.author}, consider thanking them with \`?thank <User>\``;
    }
}