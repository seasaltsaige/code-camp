import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Mute extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Mute a user",
            name: "mute",
            permissions: ["MANAGE_CHANNELS"],
            usage: "mute <user> [reason]",
            aliases: ["silence"],
        });
    }

    public async run (client: BaseClient, message: Message, args: string[]) {

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("Please mention someone to mute.");

        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });

        let muteRole = message.guild.roles.cache.get(guild.muteRole);

        if (!muteRole) {
            muteRole = await message.guild.roles.create({
                data: {
                    name: "Muted",
                    color: "#514f48",
                    permissions: [],
                },
                reason: "Mute Role Created",
            });

            guild.muteRole = muteRole.id;

            try {
                await guild.updateOne(guild);
            } catch (err) {
                return message.channel.send("Something went wrong while saving the new muted role to the database");
            }

        }

        if (member.roles.cache.has(muteRole.id)) return message.channel.send(`${member.user.tag} is already muted.`);

        const caseId = guild.infractionNumber.toString().padStart(5, "0");

        let reason = args.slice(1).join(" ");
        if (!reason) reason = `\`No Reason Provided\` - Use \`${client.baseClient.prefix}editinfraction ${caseId} <New Reason>\` to set a new reason.`;

        guild.infractions.push({
            caseId,
            date: new Date(),
            description: reason,
            infractionType: "mute",
            user: member.id,
        });

        guild.mutedUsers.push({ 
            id: member.id, 
            unmute: "none",
            oldRoles: member.roles.cache.map(role => role.id).filter(role => role !== message.guild.id),
        });

        guild.infractionNumber++;

        try {

            for (const [__, role] of member.roles.cache.filter(role => role.id !== message.guild.id)) {
                await member.roles.remove(role);
            }

            await member.roles.add(muteRole);
        } catch (err) {
            return message.channel.send("Something went wrong while adding the mute role to this member. Do they have a higher role than me?");
        };

        try {
            await guild.updateOne(guild);
        } catch (err) {
            for (const role of guild.mutedUsers.find(ob => ob.id === member.id).oldRoles) {
                await member.roles.add(role);
            }
            await member.roles.remove(muteRole);
            return message.channel.send("Something went wrong while saving mute data to the database. The mute role has been removed, please try again.");
        }

        return message.channel.send(`Successfully muted ${member.user.tag} for the reason, **${reason}**`);


    }
}   