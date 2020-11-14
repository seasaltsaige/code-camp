import { Client, ClientOptions } from "discord.js";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import baseClient from "../Interfaces/BaseClient";
import { categories } from "./Categories";

export default class BaseClient extends Client {
    constructor(public baseClient: baseClient) {
        super(baseClient.baseOptions);
    }

    public async start() {
        CommandHandler.load("./src/commands", categories, this);
        EventHandler.load("./src/events", this);
        await import("../database/database");
        this.login(this.baseClient.token);
    }
}