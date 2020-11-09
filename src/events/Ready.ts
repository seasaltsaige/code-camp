
import { TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
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
            client.baseClient.cachedGuilds.set(guild.gId, guild);
        }
        for (const rank of ranks) client.baseClient.cachedRanks.set(JSON.stringify({ gId: rank.gId, uId: rank.uId }), rank);

    }
}