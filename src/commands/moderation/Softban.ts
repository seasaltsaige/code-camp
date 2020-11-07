import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Softban extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Ban, then immediately unban someone",
            name: "softban",
            permissions: ["BAN_MEMBERS"],
            usage: "softban <user> [reason]",
            aliases: ["sban"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("Please mention someone to softban!");

        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });

        const caseId = guild.infractionNumber.toString().padStart(5, "0");

        let reason = args.slice(1).join(" ");
        if (!reason) reason = `\`No Reason Provided\` - Use \`${client.baseClient.prefix}editinfraction ${caseId} <New Reason>\` to set a new reason.`;

        if (member.bannable) {
            await member.ban({ reason }).then(m => message.guild.members.unban(m, "Softban (Unban)"));

            guild.infractions.push({
                caseId,
                date: new Date(),
                description: reason,
                infractionType: "softban",
                user: member.id,
            });

            guild.infractionNumber++;

            try {
                await guild.updateOne(guild);
            } catch (err) {
                return message.channel.send("Something went wrong while saving the banned user data to the database. The user was most likely still banned.");
            }

            return message.channel.send(`Successfully soft-banned ${member.user.tag} for ${reason}`);

        } else return message.channel.send("I can't ban that user...");
    }
}