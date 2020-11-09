import { Collection, Intents } from "discord.js";
import "dotenv/config";
import guild from "./database/models/Interfaces/guild";
import rank from "./database/models/Interfaces/rank";

import BaseClient from "./util/BaseClient";
import BaseCommand from "./util/BaseCommand";
const client = new BaseClient({
    mongoURI: process.env.MONGO,
    prefix: "?",
    token: process.env.TOKEN,
    commands: new Collection<string, BaseCommand>(),
    aliases: new Collection<string, string>(),
    cachedGuilds: new Collection<string, guild>(),
    cachedRanks: new Collection<string, rank>(),
    baseOptions: {
        partials: ["REACTION", "USER", "MESSAGE"],
        ws: { intents: Intents.ALL },
    }
});

client.start();