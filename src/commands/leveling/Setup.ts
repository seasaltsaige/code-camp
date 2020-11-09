import { Message, MessageEmbed } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import ms from "ms";
import { inspect } from "util";

export default class Setup extends BaseCommand {
    constructor() {
        super({
            category: "leveling",
            description: "Setup the leveling for the server",
            name: "levelsetup",
            permissions: ["ADMINISTRATOR"],
            usage: "levelsetup",
            aliases: ["lsetup", "ls"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({
            gId: message.guild.id
        });


        const Questions = [
            { question: "What amount of base XP would you like to require? (This number will be the amount required for level 1, and is the base for the levels to come.) Ex: You choose 500. Level 1: 500xp, Level 2: 1000xp", setting: "baseXP", answerType: "number" },
            { question: "What level multiplier would you like to use?\nMulti > 1 = Longer Level up times, Multi < 1 = Shorter Level up times", setting: "xpMulti", answerType: "number" },
            { question: "Would you like to ignore any users? Type their mention or ID's into chat now.", setting: "ignoredUsers", answerType: "array" },
            { question: "Would you like to ignore any channels? Type their mention or ID's into chat now.", setting: "ignoredChannels", answerType: "array" },
            { question: "What channel would you like level up messages sent to?", setting: "levelingChannel", answerType: "string" },
            { question: "What level up message would you like to use?\nOptions for response data: {{user}}, {{level}}, {{xp}}, {{rank}}", setting: "message", answerType: "message" },
            { question: "What amount of XP would you like the max amount a user can get in one message to be?", setting: "maxXP", answerType: "number" },
            { question: "What timeout would you like to have for users gaining xp.", setting: "cooldown", answerType: "time" },
        ];

        let msg: Message;

        let update: {} = {};

        let skipped = false;

        for (let i = 0; i < Questions.length; i++) {
            const q = Questions[i];

            const embed = new MessageEmbed()
                .setDescription(`${Questions[i - 1] && !skipped ? `${Questions[i - 1].setting} successfully set to ${update[Questions[i - 1].setting]}` : ""}${skipped ? `Successfully skipped setting ${Questions[i - 1].setting}` : ""}\n\n${q.question}\n\nType \`none\` or \`skip\` to skip this setting\nType \`cancel\` at any point to cancel.`)
                .setColor("RED");
            if (!msg) msg = await message.channel.send("", { embed });
            else msg = await msg.edit("", { embed });

            const filter = (m: Message) => message.author.id === m.author.id;
            const collector = await message.channel.awaitMessages(filter, { max: 1 });
            const m = collector.first();

            if (m && m.deletable) await m.delete();

            if (m && m.content.toLowerCase() === "cancel") {
                const Cancelled = new MessageEmbed()
                    .setDescription("Operation cancelled successfully")
                    .setColor("RED");
                return msg.edit("", { embed: Cancelled });
                break;
            } else if (m && m.content.toLowerCase() === "none" || m && m.content.toLowerCase() === "skip") {
                skipped = true;
            } else {
                const tempArgs = m.content.split(" ");
                switch (q.answerType) {
                    case "array":
                        switch (q.setting) {
                            case "ignoredUsers":
                                let mMentions = message.mentions.members.size > 0 ? message.mentions.members.array().map(m => m.id) : null;
                                if (!mMentions) {

                                    mMentions = [];

                                    const mBad: string[] = [];

                                    for (const arg of tempArgs) {
                                        if (message.guild.members.cache.get(arg)) {
                                            const mem = message.guild.members.cache.get(arg);
                                            mMentions.push(mem.id);
                                        } else {
                                            mBad.push(arg);
                                        }
                                    }
                                    if (mBad.length === tempArgs.length) {
                                        message.channel.send("Please input at least one valid ID or mention!").then(m => m.delete({ timeout: 10000 }));
                                        i--;
                                        break;
                                    }
                                    if (mBad.length > 0) message.channel.send(`Removed ${mBad.length} invaled ID's.\n${mBad.join(" | ")}`).then(m => m.delete({ timeout: 15000 }));
                                }
                                update[q.setting] = mMentions;
                                break;
                            case "ignoredChannels":
                                let cMentions = message.mentions.channels.size > 0 ? message.mentions.channels.array().map(c => c.id) : null;
                                if (!cMentions) {
                                    cMentions = [];

                                    const cBad: string[] = [];

                                    for (const arg of tempArgs) {
                                        if (message.guild.channels.cache.get(arg)) {
                                            const ch = message.guild.channels.cache.get(arg);
                                            cMentions.push(ch.id);
                                        } else {
                                            cBad.push(arg);
                                        }
                                    }
                                    if (cBad.length === tempArgs.length) {
                                        message.channel.send("Please input at least one valid ID or mention!").then(m => m.delete({ timeout: 10000 }));
                                        i--;
                                        break;
                                    }
                                    if (cBad.length > 0) message.channel.send(`Removed ${cBad.length} invaled ID's.\n${cBad.join(" | ")}`).then(m => m.delete({ timeout: 15000 }));
                                }
                                update[q.setting] = cMentions;
                                break;
                        }
                        break;
                    case "number":
                        if (isNaN(parseInt(m.content))) {
                            message.channel.send("Please enter a valid number!").then(m => m.delete({ timeout: 10000 }));
                            i--;
                        } else {
                            const num = parseFloat(m.content);
                            update[q.setting] = num;
                        }
                        break;
                    case "string":
                        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(m.content);
                        if (!channel) {
                            message.channel.send("Please mention a valid channel or enter a valid channel ID!");
                            i--;
                            break;
                        }
                        update[q.setting] = channel.id;
                        break;
                    case "time":
                        const validStamps = ["H", "M", "S"];

                        const time = tempArgs[0];

                        for (const val of validStamps) {
                            if (time.toUpperCase().includes(val)) break;
                        }

                        const MS = ms(time);

                        update[q.setting] = MS;

                        break;
                    case "message":
                        const msg = m.content;
                        update[q.setting] = msg;
                        break;
                }
                skipped = false;
            }
        }

        //@ts-ignore
        guild.xpInfo = update;

        try {
            await guild.updateOne(guild);
        } catch (err) {
            console.log(err);
            return message.channel.send("Something went wrong while trying to update your leveling settings. If you are the bot owner, please check your console.")
        }

        const DoneEm = new MessageEmbed()
            .setDescription(`Successfully updated leveling settings!\n\`\`\`json\n${inspect(update, false, 3)}\n\`\`\``)
            .setColor("RED");
        msg.edit("", { embed: DoneEm });
    }
}