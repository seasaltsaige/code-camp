import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Strike extends BaseCommand {
    constructor() {
        super({
            name: "strike",
            category: "moderation",
            description: "Strike a user",
            permissions: ["MANAGE_MESSAGES"],
            usage: "strike <user> <reason>",
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        const strikenMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!strikenMember) return message.channel.send("Please mention someone to warn!");

        let foundGuild = await Guild.findOne({ gId: message.guild.id });

        if (!foundGuild) foundGuild = await Guild.create({ gId: message.guild.id });

        let caseId = foundGuild.infractionNumber.toString();

        caseId = caseId.padStart(5, "0");

        let reason = args.slice(1).join(" ");

        if (!reason) reason = `\`No Reason Provided\` - Use \`${client.baseClient.prefix}editinfraction ${caseId} <New Reason>\` to set a new reason.`;

        foundGuild.infractions.push({
            caseId,
            date: new Date(),
            description: reason,
            infractionType: "strike",
            user: strikenMember.id,
        });

        foundGuild.infractionNumber++;

        try {
            await foundGuild.updateOne(foundGuild);
        } catch (err) {
            return message.channel.send("Something went wrong while striking that member");
        }

        return message.channel.send(`Successfully struck **${strikenMember.user.tag}** for ${reason} with an infraction ID of #${caseId}`);

    }
}