import { GuildMember, TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";

export default class GuildMemberAdd extends BaseEvent {
    constructor() {
        super({
            name: "guildMemberAdd",
            description: "Guild Member Add",
        });
    }

    public async run (client: BaseClient, member: GuildMember) {
        let guild = await Guild.findOne({ gId: member.guild.id });
        if (!guild) guild = await Guild.create({ gId: member.guild.id });

        if (guild.mutedUsers.some(u => u.id === member.id)) {
            const role = member.guild.roles.cache.get(guild.muteRole);
            if (role) member.roles.add(role);
        }

        const channel = <TextChannel>member.guild.channels.cache.get(guild.welcomeInfo.id);
        if (channel) {
            const msg = guild.welcomeInfo.message
                .replace(/{{mention}}/g, `${member}`)
                .replace(/{{tag}}/g, member.user.tag)
                .replace(/{{guild}}/g, member.guild.name);

            channel.send(msg);

            for (const roleId of guild.welcomeInfo.rolesToAdd) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) member.roles.add(role);
            }
        }
    }
}