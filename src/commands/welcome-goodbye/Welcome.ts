import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Welcome extends BaseCommand {
    constructor() {
        super({
            category: "welcome-goodbye",
            description: "Setup welcoming",
            name: "welcome",
            permissions: ["ADMINISTRATOR", "MANAGE_GUILD"],
            usage: "welcome",
        });
    }
    public async run (client: BaseClient, message: Message, args: string[]) {
        const Questions = [
            { question: "What channel would you like as your welcoming channel?", res: "channel" },
            { question: "What message would you like to have sent? {{mention}} {{tag}} {{guild}}", res: "message" },
            { question: "What role(s) would you like members to gain on join? Send the seperated by one space.", res: "roles" },
        ];

        let msg: Message;
        const tempData: { id: string, message: string, rolesToAdd: string[] } = {
            id: "",
            message: "",
            rolesToAdd: [],
        };

        for (let i = 0; i < Questions.length; i++) {
            const ques = Questions[i];

            if (ques.res === "channel") msg = await message.channel.send(ques.question);
            else msg = await msg.edit(ques.question);
            const response = await msg.channel.awaitMessages((m: Message) => m.author.id === message.author.id, { max: 1 });
            const resMessage = response.first();

            if (resMessage.content.toLowerCase() === "none") {

                message.channel.send(`Successfully set ${Questions[i].res} to none.`);
                switch (i) {
                    case 0:
                        tempData.id = "None";
                    break;
                    case 1:
                        tempData.message = "None";
                    break;
                    case 2:
                        tempData.rolesToAdd = [];
                    break;
                }

            } else if (resMessage.content.toLowerCase() === "cancel") {
                return;
            } else {

                switch (ques.res) {
                    case "channel":
                        const channelOb = resMessage.mentions.channels.first() || message.guild.channels.cache.get(resMessage.content);
                        if (!channelOb) {
                            message.channel.send("Please send a valid channel.");
                            i--;
                        } else {
                            tempData.id = channelOb.id;
                            message.channel.send(`Successfully set the welcome channel to ${channelOb}`);
                        }
                    break;
                    case "message":
                        tempData.message = resMessage.content;
                    break;
                    case "roles":
                        const arr = resMessage.content.split(" ");
                        const mentionedRoles = message.mentions.roles.array().map(r => r.id);

                        for (const role of arr) {
                            const roleOb = message.guild.roles.cache.get(role);
                            if (!roleOb) {
                                arr.splice(arr.findIndex(s => s === role), 1);
                            }
                        }
                        if (mentionedRoles.length > 0) {
                            for (const role of mentionedRoles) {
                                arr.push(role);
                            }
                        }
                        tempData.rolesToAdd = arr;
                    break;
                }
            }
        }

        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) await Guild.create({ gId: message.guild.id });

        guild.welcomeInfo = tempData;

        try {
            await guild.updateOne(guild);
        } catch (err) {
            return message.channel.send("Something went wrong while updating the information.");
        }

        return message.channel.send("Successfully setup welcoming.");

    }
}