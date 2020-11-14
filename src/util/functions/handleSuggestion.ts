import { Message, MessageEmbed } from "discord.js";
import Guild from "../../database/models/Guild";

export default async function handleSuggestions(message: Message) {
    let guild = await Guild.findOne({ gId: message.guild.id });
    if (!guild) guild = await Guild.create({ gId: message.guild.id });

    if (guild.suggestions !== message.channel.id) return;
    else {
        await message.delete();
        const content = message.content;

        if (content.length < 25) return message.reply("Please be a bit more descriptive. (25 char min)").then(m => m.delete({ timeout: 7000 }));

        const SuggestionEmbed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setDescription(content)
            .setColor("RED")
            .setFooter("Suggestion")
            .setTimestamp();
        message.channel.send("", { embed: SuggestionEmbed }).then(m => {
            m.react("👍").then(_ => m.react("👎"));
        });
    }
}