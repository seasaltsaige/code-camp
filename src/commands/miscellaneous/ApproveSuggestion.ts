import { Message, MessageReaction, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class ApproveSuggestion extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Approve Suggestions in the given suggestion channel",
            name: "approvesuggestion",
            permissions: ["ADMINISTRATOR"],
            usage: "approvesuggestion <messageId>",
            aliases: ["asuggestion", "aprsug"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });


        const suggestions = guild.suggestions;
        if (suggestions === "") return message.channel.send("Please setup the suggestions channel before trying to approve suggestions.");

        const sChannel = <TextChannel>message.guild.channels.cache.get(suggestions);
        if (sChannel) {

            const msgId = args[0];
            if (!msgId) return message.channel.send("Please provide a valid message ID");

            const msg = await sChannel.messages.fetch(msgId);
            if (!msg) return message.channel.send("That message does not exist.");

            const embed = msg.embeds[0];

            if (embed.footer.text.includes("Suggestion")) {

                const newEmbed = embed.setFooter("Approved ✅")
                    .setColor("GREEN");
                msg.edit("", { embed: newEmbed });

                return message.channel.send("Successfully approved suggestion.");

            } else return message.channel.send("That suggestion has already been modified.");

        } else return message.channel.send("It appears the suggestion channel no longer exists. Please change the channel.");


    }
}