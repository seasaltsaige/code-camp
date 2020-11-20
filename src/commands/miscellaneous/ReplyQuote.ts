import { Message, MessageAttachment } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";
import { createCanvas, loadImage, registerFont } from "canvas";

export default class ReplyQuote extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Fake reply quote someone",
            name: "replyquote",
            permissions: ["EMBED_LINKS", "SEND_MESSAGES"],
            usage: "replyquote <mainUserId> | <replyUserId> | <mainText> | <replyText>",
            aliases: ["rfq", "refakequote"],
        });
    }

    public async run(client: BaseClient, message: Message, args: string[]) {

        const quoteArgs = message.content.split(" ").slice(1).join(" ").split(" | ");

        const firstMember = message.mentions.members.first(5)[0] || message.guild.members.cache.get(quoteArgs[0]);
        if (!firstMember) return message.channel.send("Please provide a valid 1st User ID");

        const secondMember = message.mentions.members.first(5)[1] || message.guild.members.cache.get(quoteArgs[1]);
        if (!secondMember) return message.channel.send("Please provide a valid 2nd User ID");

        const mainText = quoteArgs[2];
        if (!mainText) return message.channel.send("Please provide text for the main reply!");

        const replyText = quoteArgs[3];
        if (!replyText) return message.channel.send("Please provide text for what is being replied to!");


        registerFont("./src/util/fonts/Whitney-Book.ttf", {
            family: "whitney",
        });

        registerFont("./src/util/fonts/whitney-medium.otf", {
            family: "whitneyMedium",
        });


        const canvas = createCanvas(1300, 250);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#36393E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";

        ctx.font = "38px whitney";

        ctx.fillText(mainText, 166 + 20, 220 - 20);

        ctx.font = "38px whitneyMedium";
        ctx.fillStyle = firstMember.displayHexColor === "#000000" ? "#ffffff" : firstMember.displayHexColor;
        ctx.fillText(firstMember.user.username, 165 + 20, 167 - 20);

        const usernameWidth = ctx.measureText(firstMember.user.username).width;
        ctx.fillStyle = "#d1d1d1";
        ctx.font = "38px whitney";

        ctx.fillText(" replied to ", 165 + usernameWidth + 20, 167 - 20);

        const repliedWidth = ctx.measureText(" replied to ").width;

        ctx.fillStyle = secondMember.displayHexColor === "#000000" ? "#ffffff" : secondMember.displayHexColor;
        ctx.font = "38px whitneyMedium";
        ctx.fillText(secondMember.user.username, 165 + usernameWidth + repliedWidth + 20, 167 - 20);

        const secondMemberUserWidth = ctx.measureText(secondMember.user.username).width;

        ctx.font = "26px whitneyMedium";
        ctx.fillStyle = "#7a7c80";

        const time = message.createdAt.toLocaleString().split(",")[1].split(":");
        const ampm = time.splice(2).join("").split(" ")[1];

        ctx.fillText(` Today at${time.join(":")} ${ampm}`, 165 + usernameWidth + repliedWidth + secondMemberUserWidth + 3 + 20, 167 - 20)

        ctx.font = "29px whitneyMedium";
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#d1d1d1";
        ctx.fillText(replyText, 195 + 20 + 20, 100 + 5 - 20);

        ctx.strokeStyle = "#a3a2a2";
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4;
        ctx.moveTo(34 + (105 / 2) + 70 + 20, 92 + 5 - 20);
        ctx.lineTo(34 + (105 / 2) + 20, 92 + 5 - 20);

        ctx.moveTo(34 + (105 / 2) + 20, 92 + 5 - 20);
        ctx.quadraticCurveTo(34 + (105 / 2) + 4, 92 + 5 - 20, 34 + (105 / 2), 103 + 5 - 20);

        ctx.moveTo(34 + (105 / 2), 125 - 20);
        ctx.lineTo(34 + (105 / 2), 103 + 5 - 20);
        ctx.stroke();


        ctx.globalAlpha = 1;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(90, 182 - 20, 50, 0, Math.PI * 2, true);
        ctx.strokeStyle = "#36393E";
        ctx.stroke();
        ctx.closePath();

        ctx.clip();
        const avatar = await loadImage(firstMember.user.displayAvatarURL({ format: "png", size: 2048 }));
        ctx.drawImage(avatar, 38, 130 - 20, 105, 105);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(165 + 20 + 20, 90 + 5 - 20, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "#36393E";
        ctx.stroke();
        ctx.closePath();

        ctx.clip();
        const avatar2 = await loadImage(secondMember.user.displayAvatarURL({ format: "png", size: 2048 }));
        ctx.drawImage(avatar2, 165 + 20, 70 + 5 - 20, 40, 40);
        ctx.restore();



        return message.channel.send(new MessageAttachment(canvas.toBuffer("image/png"), "rfq.png"));

    }
}