import { Message, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class DenySuggestion extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Deny suggestions in the given suggestion channel",
            name: "denysuggestion",
            permissions: ["ADMINISTRATOR"],
            usage: "denysuggestion <messageID> [reason]",
            aliases: ["dsuggestion", "sdeny"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });


        const suggestions = guild.suggestions;
        if (suggestions === "") return message.channel.send("Please setup the suggestions channel before trying to deny suggestions.");

        const sChannel = <TextChannel>message.guild.channels.cache.get(suggestions);
        if (sChannel) {

            const msgId = args[0];
            if (!msgId) return message.channel.send("Please provide a valid message ID");

            const msg = await sChannel.messages.fetch(msgId);
            if (!msg) return message.channel.send("That message does not exist.");

            let reason = args.slice(1).join(" ");
            if (!reason) reason = "No Reason Provided";

            const embed = msg.embeds[0];

            if (embed.footer.text.includes("Suggestion")) {

                const newEmbed = embed.setFooter("Denied ❌")
                    .setColor("ORANGE")
                    .setDescription(`${embed.description}\n\nDenial Reason: ${reason}`);
                msg.edit("", { embed: newEmbed });

                return message.channel.send("Successfully denied suggestion.");

            } else return message.channel.send("That suggestion has already been modified.");

        } else return message.channel.send("It appears the suggestion channel no longer exists. Please change the channel.");
    }
}