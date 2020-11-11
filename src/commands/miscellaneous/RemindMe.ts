import { Message, MessageEmbed } from "discord.js";
import ms from "ms";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class RemindMe extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Remind yourself of a specific event.",
            name: "remindme",
            permissions: ["SEND_MESSAGES"],
            usage: "remindme <time> <reminder>",
            aliases: ["rmme"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        const time = args[0];
        if (!time) return message.channel.send("Please send a time for me to remind you. Ex: (23s, 20m, 4h)");
        const reminder = args.slice(1).join(" ");
        if (!reminder) return message.channel.send("What do you want me to remind you about?");

        const timeMS = ms(time);

        const remindEmbed = new MessageEmbed()
            .setAuthor("Reminder", message.author.displayAvatarURL({ format: "png" }))
            .setColor(message.member.displayHexColor)
            .setDescription(`Alright! I will remind you in ${time} for ${reminder}`);
        message.channel.send("", { embed: remindEmbed });

        setTimeout((m: Message) => m.author.send(`Reminder: ${reminder}`), timeMS, message);

    }
}