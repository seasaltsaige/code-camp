
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

        const ranks = await Ranks.find();

        const guilds = await Guild.find();
        for (const guild of guilds) {
            if (guild.thankLB) {
                const ch = <TextChannel>client.channels.cache.get(guild.thankLB.cId);
                const m = await ch.messages.fetch(guild.thankLB.mId);
                setInterval(updateTimer, 5000, m);
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