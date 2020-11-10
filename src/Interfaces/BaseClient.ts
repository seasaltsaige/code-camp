import { ClientOptions, Collection } from "discord.js";
import guild from "../database/models/Interfaces/guild";
import rank from "../database/models/Interfaces/rank";
import BaseCommand from "../util/BaseCommand";

export default interface BaseClient {
    prefix: string;
    mongoURI: string;
    token: string;
    commands: Collection<string, BaseCommand>;
    aliases: Collection<string, string>;
    cachedGuilds: Collection<string, guild>;
    cachedRanks: Collection<string, Collection<string, rank>>;
    baseOptions: ClientOptions;
}