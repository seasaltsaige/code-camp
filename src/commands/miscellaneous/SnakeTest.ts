import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import BaseClient from "../../util/BaseClient";
import BaseCommand from "../../util/BaseCommand";

export default class Snake extends BaseCommand {
    constructor() {
        super({
            category: "miscellaneous",
            description: "Description",
            name: "snake",
            permissions: ["SEND_MESSAGES"],
            usage: "snake",
            aliases: ["snk"],
        });
    }
    async run(client: BaseClient, message: Message, args: string[]) {

        const arrOfFood = ["🍎", "🍏", "🍍", "🍒", "🍉", "🍐", "🍊", "🍋", "🍌", "🍇", "🍓"];
        let food = arrOfFood[Math.floor(Math.random() * arrOfFood.length)];
        const snake = "🔴";
        const head = "⭕";
        const end = "🟣";
        const blank = "◼️";
        const arrOfDontHit = ["🟦", "🟩", "🟧", "🟪", "🟨"];
        const dontHit = arrOfDontHit[Math.floor(Math.random() * arrOfDontHit.length)];

        let snakeLen = 1;
        const snakePos = [{ x: 0, y: 0 }];
        let foodPos = { x: 0, y: 0 }

        const createEmptyBoard = (size: number) => {
            const boardToReturn: string[][] = [];
            for (let j = 0; j < size; j++) {
                const section: string[] = [];
                for (let i = 0; i < size; i++) section.push(blank);
                boardToReturn.push(section);
            }
            return boardToReturn;
        }

        let startBoard = createEmptyBoard(12);

        const initializeBoard = (board: string[][]) => {

            const randColIndex = Math.floor(Math.random() * board.length);
            const randRowIndex = Math.floor(Math.random() * board[0].length);

            snakePos[0].y = randColIndex;
            snakePos[0].x = randRowIndex;

            const randFoodCol = Math.floor(Math.random() * board.length);
            const randFoodRow = Math.floor(Math.random() * board[0].length);

            foodPos.y = randFoodCol;
            foodPos.x = randFoodRow;

            board[randColIndex][randRowIndex] = head;
            board[randFoodCol][randFoodRow] = food;

            let string = "";

            string = string.concat(`${dontHit.repeat(14)}\n`);
            for (const section of board) string += `${dontHit}${section.join("")}${dontHit}\n`;
            string = string.concat(`${dontHit.repeat(14)}\n`);

            return { arrBoard: board, strBoard: string };
        }

        const renderBoard = () => {

            const board = createEmptyBoard(12);

            for (let i = 0; i < snakePos.length; i++) {
                let pos = snakePos[i];
                if (i === 0) board[pos.y][pos.x] = head;
                else if (i === snakePos.length - 1) board[pos.y][pos.x] = end;
                else board[pos.y][pos.x] = snake;
            }

            board[foodPos.y][foodPos.x] = food;
            let string = "";

            string = string.concat(`${dontHit.repeat(14)}\n`);
            for (const section of board) string += `${dontHit}${section.join("")}${dontHit}\n`;
            string = string.concat(`${dontHit.repeat(14)}\n`);

            return { arrBoard: board, strBoard: string };
        }

        const data = initializeBoard(startBoard);
        startBoard = data.arrBoard;

        const startEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`Snake Game`, message.author.displayAvatarURL({ format: "png" }))
            .setDescription(`Length: **${snakeLen}**\n${data.strBoard}`);
        const start = await message.channel.send("", { embed: startEmbed });

        const reactions = ["⬆️", "⬇️", "⬅️", "➡️"];
        reactions.forEach(async r => await start.react(r));

        const randomizeFood = (board: string[][]) => {
            food = arrOfFood[Math.floor(Math.random() * arrOfFood.length)];
            const newX = Math.floor(Math.random() * board.length);
            const newY = Math.floor(Math.random() * board[0].length);
            return { x: newX, y: newY };
        }

        const checkFood = (board: string[][], x: number, y: number) => {
            if (board[y] && board[y][x] && board[y][x] === food) {

                board[y][x] = snake;
                let newSpace = randomizeFood(board);
                let spaceOnBoard = board[newSpace.y][newSpace.x];

                while (spaceOnBoard !== "◼️") {
                    newSpace = randomizeFood(board);
                    spaceOnBoard = board[newSpace.y][newSpace.x];
                }

                foodPos.y = newSpace.y;
                foodPos.x = newSpace.x;

                return true;
            } else return false;
        }

        const addLength = (dirrection: "up" | "down" | "left" | "right") => {
            if (dirrection === "up") snakePos.push({ x: snakePos[0].x, y: snakePos[0].y + 1 });
            else if (dirrection === "down") snakePos.push({ x: snakePos[0].x, y: snakePos[0].y - 1 });
            else if (dirrection === "left") snakePos.push({ x: snakePos[0].x + 1, y: snakePos[0].y });
            else if (dirrection === "right") snakePos.push({ x: snakePos[0].x - 1, y: snakePos[0].y });
            snakeLen++;
        }

        const checkSnake = (board: string[][], x: number, y: number) => {
            if (board[y] && board[y][x] && board[y][x] === snake) return true;
            else return false;
        }

        const die = () => {
            collector.stop();
            start.edit(`${message.author}, you got a total score of ${snakeLen}!`, { embed: null }).then(m => m.reactions.removeAll());
        }

        const move = (dir: "up" | "down" | "left" | "right") => {
            switch (dir) {
                case "up":
                    const newHeadPosU = { x: snakePos[0].x, y: snakePos[0].y - 1 };
                    snakePos.unshift(newHeadPosU)
                    snakePos.pop();
                    break;
                case "down":
                    const newHeadPosD = { x: snakePos[0].x, y: snakePos[0].y + 1 };
                    snakePos.unshift(newHeadPosD)
                    snakePos.pop();
                    break;
                case "left":
                    const newHeadPosL = { x: snakePos[0].x - 1, y: snakePos[0].y };
                    snakePos.unshift(newHeadPosL)
                    snakePos.pop();
                    break;
                case "right":
                    const newHeadPosR = { x: snakePos[0].x + 1, y: snakePos[0].y };
                    snakePos.unshift(newHeadPosR)
                    snakePos.pop();
                    break;
            }
        }

        const filter = (reaction: MessageReaction, user: User) => reactions.includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = start.createReactionCollector(filter);
        collector.on("collect", async (reaction, user) => {

            await reaction.users.remove(user);
            const Head = snakePos[0];

            switch (reaction.emoji.name) {
                case "⬆️":
                    if (checkSnake(startBoard, Head.x, Head.y - 1)) return die();
                    if (checkFood(startBoard, Head.x, Head.y - 1)) addLength("up");
                    move("up");
                    if (Head.y - 1 < 0) return die();
                    break;
                case "⬇️":
                    if (checkSnake(startBoard, Head.x, Head.y + 1)) return die();
                    if (checkFood(startBoard, Head.x, Head.y + 1)) addLength("down");
                    move("down");
                    if (Head.y + 1 > startBoard.length - 1) return die();
                    break;
                case "⬅️":
                    if (checkSnake(startBoard, Head.x - 1, Head.y)) return die();
                    if (checkFood(startBoard, Head.x - 1, Head.y)) addLength("left");
                    move("left");
                    if (Head.x - 1 < 0) return die();
                    break;
                case "➡️":
                    if (checkSnake(startBoard, Head.x + 1, Head.y)) return die();
                    if (checkFood(startBoard, Head.x + 1, Head.y)) addLength("right");
                    move("right");
                    if (Head.x + 2 > startBoard[0].length) return die();
                    break;
            }

            const newData = renderBoard();
            startBoard = newData.arrBoard;

            const newEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(`Snake Game`, message.author.displayAvatarURL({ format: "png" }))
                .setDescription(`Length: **${snakeLen}**\n${newData.strBoard}`);
            start.edit("", { embed: newEmbed });
        });
    }
}