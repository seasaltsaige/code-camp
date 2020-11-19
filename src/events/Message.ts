import { Collection, Message, TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
import rank from "../database/models/Interfaces/rank";
import Ranks from "../database/models/Ranks";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";
import autoMod from "../util/functions/autoMod";
import checkInvite from "../util/functions/checkInvite";
import checkThank from "../util/functions/CheckThank";
import handleSuggestions from "../util/functions/handleSuggestion";
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

        const args = message.content.slice(client.baseClient.prefix.length).trim().split(" ");
        const command = args.shift();

        await autoMod(message);

        await handleSuggestions(message);

        const thank = await checkThank(message);
        if (thank && !client.baseClient.commands.get(command)) return message.channel.send(thank);

        let rank = client.baseClient.cachedRanks.get(message.guild.id) ? client.baseClient.cachedRanks.get(message.guild.id).get(message.author.id) : undefined;
        if (!rank) {
            rank = await Ranks.create({ gId: message.guild.id, uId: message.author.id });
            if (!client.baseClient.cachedGuilds.get(message.guild.id)) client.baseClient.cachedRanks.set(message.guild.id, new Collection<string, rank>())
            client.baseClient.cachedRanks.get(message.guild.id).set(message.author.id, rank);
        }
        let guild = await Guild.findOne({ gId: message.guild.id });
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
                rank.stats.totalXp += xpToAdd;

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
                setInterval(async (rank: Collection<string, Collection<string, rank>>) => {
                    try {
                        for (const CollectionOfRanks of rank.array()) {
                            for (const uRank of CollectionOfRanks.array()) {
                                const usefulData = {
                                    stats: {
                                        level: uRank.stats.level,
                                        currXp: uRank.stats.currXp,
                                        reqXp: uRank.stats.reqXp,
                                        totalXp: uRank.stats.totalXp,
                                    },
                                };

                                await Ranks.findOneAndUpdate({ gId: uRank.gId, uId: uRank.uId }, usefulData);
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }, 90000, client.baseClient.cachedRanks);
            }

        }

        let noModRole = true;

        for (const r of guild.modRoles_Users) {
            const role = message.guild.roles.cache.get(r);
            if (role && message.member.roles.cache.has(role.id)) {
                noModRole = false;
                break;
            }
        }

        if (noModRole === true && !guild.modRoles_Users.includes(message.author.id)) checkInvite(message);

        if (!message.content.startsWith(client.baseClient.prefix)) return;

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