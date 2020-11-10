import { Client, ClientOptions } from "discord.js";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import baseClient from "../Interfaces/BaseClient";

export default class BaseClient extends Client {
    constructor(public baseClient: baseClient) {
        super(baseClient.baseOptions);
    }

    public async start() {
        CommandHandler.load("./src/commands", ["general", "roles", "moderation", "welcome-goodbye", "owner", "thanking", "leveling", "invite-tracking"], this);
        EventHandler.load("./src/events", this);
        await import("../database/database");
        this.login(this.baseClient.token);
    }
}