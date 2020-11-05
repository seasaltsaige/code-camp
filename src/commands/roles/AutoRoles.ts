import { Message, MessageReaction, User } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import AutoRole from "../../database/models/AutoRole";

export default class AutoRoles extends BaseCommand {
    constructor() {
        super({
            category: "roles",
            description: "Setup Auto roles in the server.",
            name: "autoroles",
            permissions: ["ADMINISTRATOR"],
            usage: "autoroles <messageId> <Role Ids>",
            aliases: ["ar"],
        });
    }
    public async run (client: BaseClient, message: Message, args: string[]) {

        await message.delete();

        if (args[0] && args[0].toLowerCase() === "add") {
            const msgId = args[1];

            const roles = args.slice(2);

            if (!msgId) return message.channel.send("Provide a message ID for me to create into a reaction role.");

            const AutoRoleSchema = await AutoRole.create({ msgId: msgId, chId: message.channel.id });

            const reactHere = await message.channel.send("React to this message for each role you provided");
            for (const role of roles) {
                const roleOb = message.guild.roles.cache.get(role);

                reactHere.edit(`React to this message for each role you provided: Current Role: ${roleOb.name}`);

                const reaction = await reactHere.awaitReactions((reaction: MessageReaction, user: User) => user.id === message.author.id, { max: 1 });
                const Reaction = reaction.first();
                const emoji = Reaction.emoji.id || Reaction.emoji.name;

                const toReactTo = message.channel.messages.cache.get(msgId);
                toReactTo.react(Reaction.emoji);

                AutoRoleSchema.data.push({
                    emoji: {
                        id: emoji,
                    },
                    role: roleOb.id,
                });
            }

            try {
                await AutoRoleSchema.updateOne(AutoRoleSchema);
            } catch (err) {
                return message.channel.send(err.message);
            }

            reactHere.edit("Successfully setup reaction roles for this message.").then(m => m.delete({ timeout: 7000 }));

        }
    }
}