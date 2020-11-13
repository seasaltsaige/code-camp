import { Message, MessageReaction, Role, TextChannel, User } from "discord.js";
import AutoRole from "../../database/models/AutoRole";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class EditAR extends BaseCommand {
    constructor() {
        super({
            category: "roles",
            description: "Edit an existing autorole panel.",
            name: "editar",
            permissions: ["ADMINISTRATOR"],
            usage: "editar <add/remove> <channelId> <messageId> [roles]",
            aliases: ["editautoroles", "ear"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {

        const addRemove = args[0];
        if (addRemove !== "add" && addRemove !== "remove") return message.channel.send("You can only add or remove roles from a reaction panel.");

        const chId = args[1];
        const channel = <TextChannel>message.guild.channels.cache.get(chId);
        if (!channel) return message.channel.send("Please enter a valid channel ID");

        const mId = args[2];
        const msg = await channel.messages.fetch(mId);
        if (!msg) return message.channel.send("Please enter a valid message ID");

        const autoRoles = await AutoRole.findOne({ msgId: mId, chId });
        if (!autoRoles) return message.channel.send("That message is not a valid AutoRole panel.");

        const roleIds = args.slice(3);
        if (roleIds.length < 1) return message.channel.send("Please mention at least 1 valid role.");

        const Roles: string[] = [];

        for (const rId of roleIds) {
            const r = message.guild.roles.cache.get(rId);
            if (r) Roles.push(r.id);
        }

        switch (addRemove) {
            case "add":

                await message.delete();
                const reactHere = await message.channel.send("React to this message for each role you provided");

                for (const r of Roles) {
                    const roleOb = message.guild.roles.cache.get(r);

                    await reactHere.edit(`React to this message for each role you provided: Current Role: ${roleOb.name}`);

                    const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id;
                    const reactions = await reactHere.awaitReactions(filter, { max: 1 });
                    const reaction = reactions.first();

                    autoRoles.data.push({
                        emoji: {
                            id: reaction.emoji.id || reaction.emoji.name,
                        },
                        role: roleOb.id,
                    });

                    msg.react(reaction.emoji);
                }

                try {
                    await autoRoles.updateOne(autoRoles);
                } catch (err) {
                    return message.channel.send("Something went wrong while updating the database. The message was probably still reacted to.");
                }

                reactHere.edit("Successfully added roles to reaction panel.");

                break;
            case "remove":

                break;
        }
    }
}