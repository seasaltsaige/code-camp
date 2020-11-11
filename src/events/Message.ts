import { Collection, Message, TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
import Ranks from "../database/models/Ranks";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";
import checkThank from "../util/functions/CheckThank";
const Leveling = new Collection<string, Collection<string, number>>();
let initiated = new Collection<string, boolean>();

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


        const thank = checkThank(message);
        if (thank) return message.channel.send(thank);

        let rank = client.baseClient.cachedRanks.get(message.guild.id).get(message.author.id);
        if (!rank) {
            rank = await Ranks.create({ gId: message.guild.id, uId: message.author.id });
            client.baseClient.cachedRanks.get(message.guild.id).set(message.author.id, rank);
        }
        let guild = client.baseClient.cachedGuilds.get(message.guild.id);
        if (!guild) {
            guild = await Guild.create({ gId: message.guild.id });
            client.baseClient.cachedGuilds.set(guild.gId, guild);
        }

        if (!Leveling.get(message.guild.id)) Leveling.set(message.guild.id, new Collection<string, number>());
        if (!Leveling.get(message.guild.id).get(message.author.id)) Leveling.get(message.guild.id).set(message.author.id, 0);

        if (guild.xpInfo.cooldown - (Date.now() - Leveling.get(message.guild.id).get(message.author.id)) < 0) {

            if (!guild.xpInfo.ignoredUsers.includes(message.author.id) && !guild.xpInfo.ignoredChannels.includes(message.channel.id)) {

                const xpToAdd = Math.round((Math.floor(Math.random() * guild.xpInfo.maxXP) + 1) * guild.xpInfo.xpMulti);

                const xpToReach = guild.xpInfo.baseXP * rank.stats.level;

                rank.stats.currXp += xpToAdd;

                if (rank.stats.currXp >= xpToReach) {
                    rank.stats.level = rank.stats.level + 1;
                    rank.stats.currXp = 0;

                    const ch = <TextChannel>message.guild.channels.cache.get(guild.xpInfo.levelingChannel);
                    const msg = guild.xpInfo.message
                        .replace(/{{user}}/g, `${message.author}`)
                        .replace(/{{level}}/g, `${rank.stats.level}`)
                        .replace(/{{xp}}/g, `${rank.stats.currXp}`);
                    ch.send(msg);
                }

                Leveling.set(message.guild.id, new Collection());
                Leveling.get(message.guild.id).set(message.author.id, Date.now());
            }

            if (!initiated.get(message.guild.id)) {
                initiated.set(message.guild.id, true);
                setInterval(async (m: Message) => {
                    try {
                        await Ranks.findOneAndUpdate({ gId: m.guild.id, uId: m.author.id }, client.baseClient.cachedRanks.get(message.guild.id).get(message.author.id))
                    } catch (err) {
                        console.log(err);
                    }
                }, 90000, message);
            }

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