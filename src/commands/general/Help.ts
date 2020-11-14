import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import { categories } from "../../util/Categories";

export default class Help extends BaseCommand {
    constructor() {
        super({
            category: "general",
            description: "Get help with the bot",
            name: "help",
            permissions: ["SEND_MESSAGES"],
            usage: "help [command]",
            aliases: ["halp", "commands"],
        });
    }
    async run(client: BaseClient, message: Message, args: string[]) {

        const commands = client.baseClient.commands.array();
        const emojis = { 0: "1️⃣", 1: "2️⃣", 2: "3️⃣", 3: "4️⃣", 4: "5️⃣", 5: "6️⃣", 6: "7️⃣", 7: "8️⃣", 8: "9️⃣", 9: "🔟" };
        const pageEmojis = ["↩️", "⏪", "⬅️", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "➡️", "⏩", "❌"];
        const pages: string[][] = [];

        for (let i = 0; i < categories.length; i += 6) {
            pages.push(categories.slice(i, i + 6));
        }

        const initialEmbed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("Help Panel", client.user.displayAvatarURL({ format: "png" }))
            .setFooter(`Page 1/${pages.length}`);

        let page = 0;
        let commandPage = 0;
        let home_commands_command: "home" | "commands" = "home";

        const initialData = pages[page];

        const mapped: string[][] = initialData.map((d, i) => [emojis[i], d]);

        for (const arr of mapped) {
            initialEmbed.addField(arr[1], `Click ${arr[0]} to view`, true);
        }

        const m = await message.channel.send("", { embed: initialEmbed });

        pageEmojis.forEach(e => m.react(e));

        const filter = (reaction: MessageReaction, user: User) => pageEmojis.includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = m.createReactionCollector(filter, { time: 60000 * 5 });

        const history: MessageEmbed[] = [];

        let cmdsPages: string[][] = [];

        collector.on("collect", async (reaction, __) => {

            reaction.users.remove(__.id);

            switch (reaction.emoji.name) {
                case "↩️":
                    const oldPage = history.pop();

                    if (m.embeds[0].author.name.includes("Command") && oldPage.author.name.includes("Panel")) home_commands_command = "home";

                    return m.edit("", { embed: oldPage });
                case "⏪":
                    if (home_commands_command === "home") page = 0;
                    else if (home_commands_command === "commands") commandPage = 0;
                    break;
                case "⬅️":
                    if (home_commands_command === "home") {
                        if (page !== 0) page--;
                    } else if (home_commands_command === "commands") {
                        if (commandPage !== 0) commandPage--;
                    }
                    break;
                case "1️⃣":
                    return reactionPage(0);
                case "2️⃣":
                    return reactionPage(1);
                case "3️⃣":
                    return reactionPage(2);
                case "4️⃣":
                    return reactionPage(3);
                case "5️⃣":
                    return reactionPage(4);
                case "6️⃣":
                    return reactionPage(5);
                case "➡️":
                    if (home_commands_command === "home") {
                        if (page !== (pages.length - 1)) page++;
                    } else if (home_commands_command === "commands") {
                        if (commandPage !== (cmdsPages.length - 1)) commandPage++;
                    }
                    break;
                case "⏩":
                    if (home_commands_command === "home") page = pages.length - 1;
                    else if (home_commands_command === "commands") commandPage = cmdsPages.length - 1;
                    break;
                case "❌":
                    return collector.stop("❌");
            }

            history[history.length - 1] !== m.embeds[0] ? history.push(m.embeds[0]) : undefined;

            if (home_commands_command === "home") {
                const newEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setAuthor("Help Panel", client.user.displayAvatarURL({ format: "png" }))
                    .setFooter(`Page ${page + 1}/${pages.length}`);

                const newData = pages[page];
                const newMapped: string[][] = newData.map((d, i) => [emojis[i], d]);

                for (const arr of newMapped) {
                    newEmbed.addField(arr[1], `Click ${arr[0]} to view`, true);
                }

                await m.edit("", { embed: newEmbed });
            } else if (home_commands_command === "commands") {
                const newEmbed = new MessageEmbed()
                    .setColor("BLUE")
                    .setAuthor("Command Help", client.user.displayAvatarURL({ format: "png" }))
                    .setFooter(`Page ${commandPage + 1}/${cmdsPages.length ? cmdsPages.length : 1}`);

                const newData = cmdsPages[commandPage];

                const newMapped: string[][] = newData.map((c, i) => [emojis[i], c]);

                for (const arr of newMapped) {
                    newEmbed.addField(arr[1], `Click ${arr[0]} to view`, true)
                }

                await m.edit("", { embed: newEmbed });

            }

        });

        collector.on("end", async (__, reason) => {
            if (reason === "❌") {
                await m.reactions.removeAll();
                const endedEmbed = new MessageEmbed()
                    .setDescription("Closed by user")
                    .setAuthor("Ended", message.author.displayAvatarURL({ format: "png" }))
                    .setColor("BLUE");
                return m.edit("", { embed: endedEmbed });
            }
        });

        function reactionPage(index: number) {
            const data = pages[page][index];
            if (home_commands_command === "home" && data) {
                cmdsPages = [];
                const pageData = commands.filter(c => c.BaseCommandInfo.category === data).map(c => c.BaseCommandInfo.name);
                const cmdDataPage = new MessageEmbed()
                    .setColor("BLUE")
                    .setAuthor("Command Help", client.user.displayAvatarURL({ format: "png" }))

                for (let i = 0; i < pageData.length; i += 6) {
                    cmdsPages.push(pageData.slice(i, i + 6))
                }

                cmdDataPage.setFooter(`Page ${commandPage + 1}/${cmdsPages.length}`);

                const initialCommandData = cmdsPages[commandPage];

                const mappedCmds: string[][] = initialCommandData.map((c, i) => [emojis[i], c]);

                for (const cmd of mappedCmds) {
                    cmdDataPage.addField(cmd[1], `Click ${cmd[0]} to view`, true);
                };

                home_commands_command = "commands";

                history.push(m.embeds[0]);

                return m.edit("", { embed: cmdDataPage });
            } else if (home_commands_command === "commands") {
                const cmdData = cmdsPages[commandPage][index];
                if (cmdData) {
                    const cmd = commands.find(c => c.BaseCommandInfo.name === cmdData);
                    const commandEmbed = new MessageEmbed()
                        .setAuthor(`${cmd.BaseCommandInfo.name} Help`, client.user.displayAvatarURL({ format: "png" }))
                        .setColor("BLUE")
                        .setDescription(`Name: ${cmd.BaseCommandInfo.name}\nAliases: ${cmd.BaseCommandInfo.aliases ? cmd.BaseCommandInfo.aliases.join(", ") : "None"}\nUsage: ${client.baseClient.prefix}${cmd.BaseCommandInfo.usage}\nCategory: ${cmd.BaseCommandInfo.category}\nRequired Permissions: ${cmd.BaseCommandInfo.permissions.join(", ")}`);

                    history.push(m.embeds[0]);

                    return m.edit("", { embed: commandEmbed });
                }
            }
        }
    }
}