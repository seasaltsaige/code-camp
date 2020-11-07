import { Message, MessageEmbed } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import { inspect } from "util";

export default class Eval extends BaseCommand {
    constructor() {
        super({
            category: "owner",
            description: "Evaluate JS Code",
            name: "eval",
            permissions: ["ADMINISTRATOR"],
            ownerOnly: true,
            usage: "eval <code>",
        });
    }

    public async run (client: BaseClient, message: Message, args: string[]) {
        
        try {
            let toEval = args.join(" ");
            let evaluated = eval(toEval);
            let hrStart = process.hrtime();
            let hrDiff;
            hrDiff = process.hrtime(hrStart);
      
            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setFooter(`Evaluated in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ""}${hrDiff[1] / 1000}ms.`)
                .setTitle("Eval")
                .addField("To evaluate", `\`\`\`javascript\n${args.join(" ") || "None"}\n\`\`\``)
                .addField("Evaluated", `\`\`\`javascript\n${inspect(evaluated, false, 1) || "None"}\n\`\`\``)
                .addField("Type Of", typeof evaluated);
            await message.channel.send(embed).catch(async (e) => {

                const errembed = new MessageEmbed()
                  .setTitle("Error")
                  .setColor("RED")
                  .setFooter(`Error while evaluating.`)
                  .addField("To Evaluate", `\`\`\`javascript\n${args.join(" ") || "None"}\n\`\`\``)
                  .addField("Error", `\`\`\`javascript\n${e.message || "None"}\n\`\`\``);
                await message.channel.send(errembed);
            });
        } catch (error) {
            const errembed = new MessageEmbed()
                .setTitle("Error")
                .setColor("RED")
                .setFooter(`Error while evaluating.`)
                .addField("To Evaluate", `\`\`\`javascript\n${args.join(" ") || "None"}\n\`\`\``)
                .addField("Error", `\`\`\`javascript\n${error || "None"}\n\`\`\``);
            message.channel.send(errembed).catch(async (e) => {

                const errembed = new MessageEmbed()
                    .setTitle("Error")
                    .setColor("RED")
                    .setFooter(`Error while evaluating.`)
                    .addField("To Evaluate", `\`\`\`javascript\n${args.join(" ") || "None"}\n\`\`\``)
                    .addField("Error", `\`\`\`javascript\n${e.message || "None"}\n\`\`\``);
                await message.channel.send(errembed);
            });
        }


    }
}