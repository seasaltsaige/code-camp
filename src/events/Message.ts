import { Message } from "discord.js";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";

export default class Msg extends BaseEvent {
    constructor() {
        super({
            name: "message",
            description: "Message event",
        });
    }
    async run(client: BaseClient, message: Message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content.startsWith(client.baseClient.prefix)) return;

        const args = message.content.slice(client.baseClient.prefix.length).trim().split(" ");
        const command = args.shift();

        const commandFile = client.baseClient.commands.get(command) || client.baseClient.commands.get(client.baseClient.aliases.get(command));

        if (commandFile) {

            for (const perm of commandFile.BaseCommandInfo.permissions) {
                if (!message.member.permissions.has(perm)) return message.channel.send("You do not have permission to use this command.");
            }

            if (commandFile.BaseCommandInfo.g_owner_only && message.author.id !== message.guild.ownerID) return message.channel.send("Only the guild owner can use this command.");

            if (commandFile.BaseCommandInfo.ownerOnly && message.author.id !== "408080307603111936") return message.channel.send("You aren't the bot owner.");

            return commandFile.run(client, message, args);

        }

    }
}