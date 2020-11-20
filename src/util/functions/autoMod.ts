import { Message, Collection, TextChannel, Snowflake } from "discord.js";
import Guild from "../../database/models/Guild";
import { findBestMatch } from "string-similarity";
import guild from "../../database/models/Interfaces/guild";
const talkedRecently: string[] = [];
const alertedUsers = new Collection<Snowflake, Snowflake>();
const repetitiveSpamAlerted = new Collection<Snowflake, Snowflake>();
const muted: string[] = [];
const repetitiveSpam: { content: string; uId: string }[] = [];

export default async function autoMod(message: Message) {
    const guild = await Guild.findOne({ gId: message.guild.id });
    if (!guild) return;

    if (guild.modRoles_Users.includes(message.author.id)) return;
    for (const r of guild.modRoles_Users) {
        if (message.member.roles.cache.has(r)) return;
    }


    talkedRecently.push(message.author.id);

    if (repetitiveSpam.filter(d => d.uId === message.author.id).length < 6) repetitiveSpam.push({ content: message.content, uId: message.author.id });

    setTimeout(() => talkedRecently.splice(talkedRecently.findIndex(el => el === message.author.id), 1), 4000);
    setTimeout(() => repetitiveSpam.splice(repetitiveSpam.findIndex(el => el.uId === message.author.id), 1), 15000);

    const userSpam = repetitiveSpam.filter(el => el.uId === message.author.id)

    if (userSpam.length >= 5) {

        if (repetitiveSpamAlerted.get(message.author.id)) {

            if (muted.includes(message.author.id)) return;

            muteUser(message, guild, "Repetitive Spam (Auto Mod)");

            return message.channel.send(`${message.author.username} was muted for \`Repetitive Spam (Auto Mod)\`.`);

        }

        const data = findBestMatch(message.content, userSpam.map(d => d.content));


        const arrOfRatings = data.ratings.map(d => d.rating);

        let finalAdd = 0;

        for (const num of arrOfRatings) {
            finalAdd += num;
        }

        const average = finalAdd / arrOfRatings.length;

        if (average >= 0.5) {
            repetitiveSpamAlerted.set(message.author.id, message.guild.id);

            const msgs = await message.channel.messages.fetch({ limit: 100 });
            const uMsgs = msgs.filter(msg => msg.author.id === message.author.id).array().splice(0, userSpam.length);

            await (<TextChannel>message.channel).bulkDelete(uMsgs);

            for (const el of repetitiveSpam.filter(d => d.uId === message.author.id)) {
                repetitiveSpam.splice(repetitiveSpam.findIndex(element => element.content === el.content));
            }

            return message.reply("Please stop repeating yourself.");
        }

    }

    if (talkedRecently.filter(el => el === message.author.id).length >= 5) {
        const msgs = await message.channel.messages.fetch({ limit: 100 });

        const usersMsgs = msgs.filter(msg => msg.author.id === message.author.id).array().splice(0, talkedRecently.filter(el => el === message.author.id).length);
        await (<TextChannel>message.channel).bulkDelete(usersMsgs);

        if (alertedUsers.get(message.author.id)) {

            if (muted.includes(message.author.id)) return;

            await muteUser(message, guild, "Spamming (Auto Mod)");

            return message.channel.send(`${message.author.username} was muted for \`Spamming (Auto Mod)\`.`);

        } else {
            alertedUsers.set(message.author.id, message.guild.id);
            return message.reply("Stop spamming!");
        };
    }


}

async function muteUser(message: Message, guild: guild, reason: string) {

    const muteRole = guild.muteRole;

    const uRoles = message.member.roles.cache.array().map(r => r.id).filter(r => r !== message.guild.id);

    guild.mutedUsers.push({
        id: message.author.id,
        oldRoles: uRoles,
        unmute: "none",
    });

    const caseId = guild.infractionNumber.toString().padStart(5, "0");

    guild.infractions.push({
        caseId,
        date: new Date(),
        description: reason,
        infractionType: "mute",
        user: message.author.id,
    });

    for (const r of uRoles) {
        message.member.roles.remove(r);
    }

    guild.infractionNumber++;

    message.member.roles.add(muteRole);

    await guild.updateOne(guild);

    muted.push(message.author.id);
}