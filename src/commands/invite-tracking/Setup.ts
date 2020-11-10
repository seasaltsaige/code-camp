import { Message } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class ISetup extends BaseCommand {
    constructor() {
        super({
            category: "invite-tracking",
            description: "Setup tracking invites.",
            name: "isetup",
            permissions: ["ADMINISTRATOR"],
            usage: "isetup",
            aliases: ["invitesetup"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {


    }
}