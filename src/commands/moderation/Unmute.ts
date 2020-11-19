import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Unmute extends BaseCommand {
    constructor() {
        super({
            category: "moderation",
            description: "Unmute a user",
            name: "unmute",
            permissions: ["MANAGE_CHANNELS"],
            usage: "unmute <user> [reason]",
        });
    }

    public async run(client: BaseClient, message: Message, args: string[]) {

        let guild = await Guild.findOne({ gId: message.guild.id });

        if (!guild) guild = await Guild.create({ gId: message.guild.id });
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (guild.modRoles_Users.includes(member.id)) return message.channel.send("You can't unmute that member. They are on the mod list.");
        for (const rm of guild.modRoles_Users) {
            const r = message.guild.roles.cache.get(rm);
            if (r && member.roles.cache.has(r.id)) return message.channel.send(`You can't unmute members with the ${r.name} role.`);
        }



        const oldRoles = guild.mutedUsers.find(ob => ob.id === member.id).oldRoles;

        try {
            await member.roles.remove(guild.muteRole);
            for (const role of oldRoles) {
                await member.roles.add(role);
            }


            guild.mutedUsers.splice(guild.mutedUsers.findIndex(ob => ob.id === member.id), 1);

            await guild.updateOne(guild);


        } catch (err) {
            console.log(err);
            return message.channel.send(`Something went wrong while unmuting ${member.user.tag}`);
        }

        return message.channel.send(`Successfully unmuted ${member.user.tag}`);

    }
}