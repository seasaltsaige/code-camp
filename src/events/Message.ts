import { Collection, Message } from "discord.js";
import Guild from "../database/models/Guild";
import rank from "../database/models/Interfaces/rank";
import Ranks from "../database/models/Ranks";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";
const Leveling = new Collection<string, Collection<string, number>>();


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


        let rank = client.baseClient.cachedRanks.get(JSON.stringify({ gId: message.guild.id, uId: message.author.id }));
        if (!rank) {
            rank = await Ranks.create({ gId: message.guild.id, uId: message.author.id });
            client.baseClient.cachedRanks.set(JSON.stringify({ gId: message.guild.id, uId: message.author.id }), rank);
        }
        let guild = client.baseClient.cachedGuilds.get(message.guild.id);
        if (!guild) {
            guild = await Guild.create({ gId: message.guild.id });
            client.baseClient.cachedGuilds.set(guild.gId, guild);
        }

        if (Leveling.get(message.guild.id) && guild.xpInfo.cooldown - (Date.now() - Leveling.get(message.guild.id).get(message.author.id)) < 0) {
            const xpToAdd = Math.floor(Math.random() * guild.xpInfo.maxXP) + 1;

            const xpToReach = guild.xpInfo.baseXP * rank.stats.level;
        }


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