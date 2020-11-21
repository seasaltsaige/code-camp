import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class RestrictCommands extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Restrict all commands to a specific channel",
            name: "restrictcommands",
            permissions: ["ADMINISTRATOR"],
            usage: "restrictcommands <Channel>",
            aliases: ["rc", "rcmds", "rcommands", "restrictc"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });


        const setReset = args[0];
        if (setReset.toLowerCase() !== "set" && setReset.toLowerCase() !== "reset") return message.channel.send("Please specify if you want to set or reset the restricted commands channel.");
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (!channel) return message.channel.send("Please mention a valid channel.");

        switch (setReset.toLowerCase()) {
            case "set":
                guild.restrictedChannel = channel.id;
                break;
            case "reset":
                guild.restrictedChannel = "";
                break;
        }

        try {
            await guild.updateOne(guild);
        } catch (err) {
            return message.channel.send("Something went wrong while updating the database.");
        }

        return message.channel.send(setReset.toLowerCase() === "set" ? `Successfully set the restricted channel to ${channel}. Mod Roles and Mod Users remain unaffected.` : "Successfully reset your restricted channel. You can now use commands anywhere.");

    }
}