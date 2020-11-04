import { Collection } from "discord.js";
import BaseCommand from "../util/BaseCommand";

export default interface BaseClient {
    prefix: string;
    mongoURI: string;
    token: string;
    commands: Collection<string, BaseCommand>;
    aliases: Collection<string, string>;
}