import { Message, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Suggest extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Setup a suggestion ",
            name: "suggestions",
            permissions: ["ADMINISTRATOR"],
            usage: "suggestions",
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {

        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (channel.type !== "text") return message.channel.send("Please mention a text channel.");
        if (channel.id === guild.suggestions) return message.channel.send("That is already the suggestion channel, please choose a new channel.");


        guild.suggestions = channel.id;

        try {
            await guild.updateOne(guild);
        } catch (err) {
            return message.channel.send("Something went wrong.");
        }

        return message.channel.send(`Successfully set ${channel} as the suggestions channel.`);


    }
}