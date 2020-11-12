
import { TextChannel, Collection } from "discord.js";
import Guild from "../database/models/Guild";
import rank from "../database/models/Interfaces/rank";
import Ranks from "../database/models/Ranks";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";
import updateTimer from "../util/functions/UpdateTimer";

export default class Ready extends BaseEvent {
    constructor() {
        super({
            name: "ready",
            description: "Ready event",
        });
    }
    async run(client: BaseClient) {
        console.log(`Logged in as ${client.user.username} into ${client.guilds.cache.size} server(s)`);

        client.user.setStatus("dnd");
        client.user.setActivity({
            name: "over Code Camp",
            type: "WATCHING",
        });

        const ranks = await Ranks.find();

        const guilds = await Guild.find();
        for (const guild of guilds) {
            if (guild.thankLB) {
                const ch = <TextChannel>client.channels.cache.get(guild.thankLB.cId);
                const m = await ch.messages.fetch(guild.thankLB.mId);
                setInterval(updateTimer, 5000, m);
            }

            if (guild.counterInfo) {

                setInterval(async () => {

                    if (guild.counterInfo.members !== "") {
                        const mCh = client.guilds.cache.get(guild.gId).channels.cache.get(guild.counterInfo.members);
                        if (mCh) await mCh.setName(`Members: ${client.guilds.cache.get(guild.gId).members.cache.size}`);
                    }

                    if (guild.counterInfo.bots !== "") {
                        const bCh = client.guilds.cache.get(guild.gId).channels.cache.get(guild.counterInfo.bots);
                        if (bCh) await bCh.setName(`Bots: ${client.guilds.cache.get(guild.gId).members.cache.filter(m => m.user.bot).size}`);
                    }

                    if (guild.counterInfo.users !== "") {
                        const uCh = client.guilds.cache.get(guild.gId).channels.cache.get(guild.counterInfo.users);
                        if (uCh) await uCh.setName(`Users: ${client.guilds.cache.get(guild.gId).members.cache.filter(m => !m.user.bot).size}`);
                    }

                    if (guild.counterInfo.channels !== "") {
                        const cCh = client.guilds.cache.get(guild.gId).channels.cache.get(guild.counterInfo.channels);
                        if (cCh) await cCh.setName(`Channels: ${client.guilds.cache.get(guild.gId).channels.cache.size}`);
                    }

                }, (60 * 1000 * 5) * 1.1)

            }

        }

        for (const g of client.guilds.cache.array()) {
            const guildDoc = await Guild.findOne({ gId: g.id });
            client.baseClient.cachedGuilds.set(g.id, guildDoc);
        }

        for (const rank of ranks) {
            if (!client.baseClient.cachedRanks.get(rank.gId)) client.baseClient.cachedRanks.set(rank.gId, new Collection<string, rank>().set(rank.uId, rank));
            else client.baseClient.cachedRanks.get(rank.gId).set(rank.uId, rank);
        }

    }
}   