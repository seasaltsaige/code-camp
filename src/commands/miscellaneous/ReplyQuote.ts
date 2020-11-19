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

        const firstMember = message.guild.members.cache.get(quoteArgs[0]);
        if (!firstMember) return message.channel.send("Please provide a valid 1st User ID");

        const secondMember = message.guild.members.cache.get(quoteArgs[1]);
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


        const canvas = createCanvas(1300, 280);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#36393E";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";

        ctx.font = "38px whitney";

        ctx.fillText(mainText, 166, 220);

        ctx.font = "38px whitneyMedium";
        ctx.fillStyle = firstMember.displayHexColor === "#000000" ? "#ffffff" : firstMember.displayHexColor;
        ctx.fillText(firstMember.user.username, 165, 167);

        const usernameWidth = ctx.measureText(firstMember.user.username).width;
        ctx.fillStyle = "#d1d1d1";
        ctx.font = "38px whitney";

        ctx.fillText(" replied to ", 165 + usernameWidth, 167);

        const repliedWidth = ctx.measureText(" replied to ").width;

        ctx.fillStyle = secondMember.displayHexColor === "#000000" ? "#ffffff" : secondMember.displayHexColor;
        ctx.font = "38px whitneyMedium";
        ctx.fillText(secondMember.user.username, 165 + usernameWidth + repliedWidth, 167);

        const secondMemberUserWidth = ctx.measureText(secondMember.user.username).width;

        ctx.font = "26px whitneyMedium";
        ctx.fillStyle = "#7a7c80";

        const time = message.createdAt.toLocaleString().split(",")[1].split(":");
        const ampm = time.splice(2).join("").split(" ")[1];

        ctx.fillText(` Today at${time.join(":")} ${ampm}`, 165 + usernameWidth + repliedWidth + secondMemberUserWidth + 3, 167)

        ctx.font = "25px whitney";
        ctx.fillStyle = "#d1d1d1";
        ctx.fillText(replyText, 195 + 30, 100);

        ctx.strokeStyle = "#a3a2a2";
        ctx.lineWidth = 2;
        ctx.moveTo(34 + (105 / 2) + 80, 92);
        ctx.lineTo(34 + (105 / 2) + 20, 92);
        ctx.stroke();

        ctx.moveTo(34 + (105 / 2) + 20, 92);
        ctx.bezierCurveTo(34 + (105 / 2), 92, 34 + (105 / 2), 92, 34 + (105 / 2), 103)

        ctx.moveTo(34 + (105 / 2), 125);
        ctx.lineTo(34 + (105 / 2), 103);
        ctx.stroke();


        ctx.globalAlpha = 1;
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(90, 182, 50, 0, Math.PI * 2, true);
        ctx.strokeStyle = "#36393E";
        ctx.stroke();
        ctx.closePath();

        ctx.clip();
        const avatar = await loadImage(firstMember.user.displayAvatarURL({ format: "png", size: 2048 }));
        ctx.drawImage(avatar, 38, 130, 105, 105);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(165 + 30, 90, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "#36393E";
        ctx.stroke();
        ctx.closePath();

        ctx.clip();
        const avatar2 = await loadImage(secondMember.user.displayAvatarURL({ format: "png", size: 2048 }));
        ctx.drawImage(avatar2, 165 + 10, 70, 40, 40);
        ctx.restore();



        return message.channel.send(new MessageAttachment(canvas.toBuffer("image/png"), "rfq.png"));

    }
}