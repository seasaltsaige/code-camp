
import { TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
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

        const guilds = await Guild.find();
        for (const guild of guilds) {
            if (guild.thankLB) {
                const ch = <TextChannel>client.channels.cache.get(guild.thankLB.cId);
                const m = await ch.messages.fetch(guild.thankLB.mId);
                setInterval(updateTimer, 5000, m);
            }
        }
    }
}