import { Message, MessageEmbed } from "discord.js";
import Guild from "../../database/models/Guild";
import Ranks from "../../database/models/Ranks";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Rank extends BaseCommand {
    constructor() {
        super({
            category: "leveling",
            description: "See the top users in the server",
            name: "leaderboard",
            permissions: ["SEND_MESSAGES"],
            usage: "leaderboard",
            aliases: ["lb"],
        });
    }
    public async run(client: BaseClient, message: Message, args: string[]) {
        let guild = await Guild.findOne({ gId: message.guild.id });
        if (!guild) guild = await Guild.create({ gId: message.guild.id });
        const allData = client.baseClient.cachedRanks.get(message.guild.id).array();
        const allSortedData = allData.sort((a, b) => b.stats.totalXp - a.stats.totalXp);
function generateLbEmbed(message, levels){
  const embeds = [];
      let k = 10;
      for (let i = 0; i < levels.length; i += 10) {
        const current = levels.slice(i, k);
        let j = i;
        k += 10;
     let info  = levels.map(level => `${allSortedData.findIndex((rank) => rank.uId === level.uId) + 1}. ${client.users.cache.get(level.uId).tag} ${await Ranks.findOne({ gId: message.guild.id, uId: level.uId }).stats.currXp}/${guild.xpInfo.baseXP * await Ranks.findOne({ gId: message.guild.id, uId: level.uId }).stats.level}`)
        embeds.push(embed);
      }
      return embeds;
}
      let currentPage = 0;


    const embeds = generateLbEmbed(message, allSortedData);
    if (args[0]) {

      if (isNaN(args[0])) {
        currentPage = 0

      } else if (args[0] < 0) {
        currentPage = 0
      } else if (args[0] > embeds.length - 1) {
        currentPage = embeds.length - 1
      } else {
        currentPage = parseInt(args[0] - 1)
      }
    }
      if(embeds.length === 0) return message.reply("No levels found")
    const queueEmbed = await message.channel.send(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
    await queueEmbed.react('⬅️');
    await queueEmbed.react('⏹');
    await queueEmbed.react('➡️');

    const filter = (reaction: MessageReaction, user: User) => ['⬅️', '⏹', '➡️'].includes(reaction.emoji.name) && (message.author.id === user.id);
    const collector = queueEmbed.createReactionCollector(filter);

    collector.on('collect', async (reaction: MessageReaction, user: User) => {
      try {
        if (reaction.emoji.name === '➡️') {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
          }
        } else if (reaction.emoji.name === '⬅️') {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
      } catch (err) {
        message.reply(err.message)
      }
    })
    }
}