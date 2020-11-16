import { MessageReaction, User } from "discord.js";
import AutoRole from "../database/models/AutoRole";
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";

export default class MessageReactionAdd extends BaseEvent {
    constructor() {
        super({
            name: "messageReactionAdd",
            description: "Reaction Add",
        });
    }
    async run(client: BaseClient, reaction: MessageReaction, user: User) {

        if (user.bot) return;

        if (reaction.message.partial) {
            await reaction.message.fetch();
            await reaction.fetch();
        }

        const guild = client.guilds.cache.get(reaction.message.guild.id);
        const member = guild.members.cache.get(user.id);

        const autoRole = await AutoRole.findOne({ msgId: reaction.message.id, chId: reaction.message.channel.id });

        if (autoRole !== null) {

            const data = autoRole.data.find(d => d.emoji.id === reaction.emoji.id || d.emoji.id === reaction.emoji.name);

            if (data) {
                const role = data.role;

                const roleToAdd = guild.roles.cache.get(role);

                await member.roles.add(roleToAdd);
            }
        }
    }
}