import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class CSetup extends BaseCommand {
    constructor() {
        super({
            category: "channel-counter",
            description: "Setup channel counters for server stats.",
            name: "csetup",
            permissions: ["ADMINISTRATOR"],
            usage: "csetup",
            aliases: ["countersetup", "ccsetup"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {

        let members = false;
        let bots = false;
        let users = false;
        let channels = false;

        const Embed = new MessageEmbed()
            .setAuthor("Channel Counter Setup", message.author.displayAvatarURL({ format: "png" }))
            .setColor(message.member.displayHexColor)
            .setDescription(`1️⃣: Members ${members ? "✓" : "✗"}\n2️⃣: Bots ${bots ? "✓" : "✗"}\n3️⃣: Users ${users ? "✓" : "✗"}\n4️⃣: Channels ${channels ? "✓" : "✗"}`)
        const msg = await message.channel.send("", { embed: Embed });

        await Promise.all(
            [
                msg.react("1️⃣"),
                msg.react("2️⃣"),
                msg.react("3️⃣"),
                msg.react("4️⃣"),
                msg.react("✅"),
                msg.react("❌"),
            ],
        );

        const collector = msg.createReactionCollector((reaction: MessageReaction, user: User) => ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60 * 1000 });

        collector.on("collect", (reaction, user) => {
            switch (reaction.emoji.name) {
                case "1️⃣":
                    members = !members;
                    break;
                case "2️⃣":
                    bots = !bots;
                    break;
                case "3️⃣":
                    users = !users;
                    break;
                case "4️⃣":
                    channels = !channels;
                    break;
                case "✅":
                    return collector.stop("Accept");
                case "❌":
                    return collector.stop("Cancel");
            }

            Embed.setDescription(`1️⃣: Members ${members ? "✓" : "✗"}\n2️⃣: Bots ${bots ? "✓" : "✗"}\n3️⃣: Users ${users ? "✓" : "✗"}\n4️⃣: Channels ${channels ? "✓" : "✗"}`);
            msg.edit("", { embed: Embed });

        });


        collector.on("end", async (_, reason) => {
            if (reason === "Cancel") msg.edit("Cancelled operation successfully.", { embed: null }).then(m => m.delete({ timeout: 10000 }));
            else {

                await msg.delete();

                let guild = await Guild.findOne({ gId: message.guild.id });
                if (!guild) guild = await Guild.create({ gId: message.guild.id });

                const data = {
                    bots: "",
                    channels: "",
                    members: "",
                    parent: "",
                    users: "",
                };

                const parent = await message.guild.channels.create("Server Stats", {
                    type: "category",
                    permissionOverwrites: [
                        {
                            deny: "CONNECT",
                            id: message.guild.id,
                        },
                    ],
                });

                data.parent = parent.id;

                if (members) {
                    const member = await message.guild.channels.create(`Members: ${message.guild.members.cache.size}`, {
                        type: "voice",
                        parent: parent.id,
                    });
                    data.members = member.id;
                }

                if (bots) {
                    const bot = await message.guild.channels.create(`Bots: ${message.guild.members.cache.filter(m => m.user.bot).size}`, {
                        type: "voice",
                        parent: parent.id,
                    });
                    data.bots = bot.id;
                }

                if (users) {
                    const user = await message.guild.channels.create(`Users: ${message.guild.members.cache.filter(m => !m.user.bot).size}`, {
                        type: "voice",
                        parent: parent.id,
                    });
                    data.users = user.id;
                }

                if (channels) {
                    const channel = await message.guild.channels.create(`Channels: ${message.guild.channels.cache.size}`, {
                        type: "voice",
                        parent: parent.id,
                    });
                    data.channels = channel.id;
                }

                await parent.setPosition(0);

                try {
                    guild.counterInfo = data;
                    await guild.updateOne(guild);


                    setInterval(async () => {

                        if (guild.counterInfo.members !== "") {
                            const mCh = message.guild.channels.cache.get(guild.counterInfo.members);
                            if (mCh) await mCh.setName(`Members: ${message.guild.members.cache.size}`);
                        }

                        if (guild.counterInfo.bots !== "") {
                            const bCh = message.guild.channels.cache.get(guild.counterInfo.bots);
                            if (bCh) await bCh.setName(`Bots: ${message.guild.members.cache.filter(m => m.user.bot).size}`);
                        }

                        if (guild.counterInfo.users !== "") {
                            const uCh = message.guild.channels.cache.get(guild.counterInfo.users);
                            if (uCh) await uCh.setName(`Users: ${message.guild.members.cache.filter(m => !m.user.bot).size}`);
                        }

                        if (guild.counterInfo.channels !== "") {
                            const cCh = message.guild.channels.cache.get(guild.counterInfo.channels);
                            if (cCh) await cCh.setName(`Channels: ${message.guild.channels.cache.size}`);
                        }

                    }, (60 * 1000 * 5) * 1.1)

                } catch (err) {
                    return message.channel.send("Something went wrong while updating the Database, the channels were probably still created.")
                }

                return message.channel.send("Successfully setup channel counters.");

            }
        });

    }
}