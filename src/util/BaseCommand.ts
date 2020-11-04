import { Message, PermissionResolvable, GuildMember } from "discord.js";
import BaseCommandInfo from "../Interfaces/BaseCommandInfo";
import BaseClient from "./BaseClient";

export default abstract class BaseCommand {

    constructor(public BaseCommandInfo: BaseCommandInfo) {};

    abstract async run(client: BaseClient, message: Message, args: Array<string>): Promise<any>;

}