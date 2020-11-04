import { Client, ClientOptions } from "discord.js";
import CommandHandler from "../handlers/CommandHandler";
import EventHandler from "../handlers/EventHandler";
import baseClient from "../Interfaces/BaseClient";

export default class BaseClient extends Client {
    constructor(public baseClient: baseClient, public BaseOptions?: ClientOptions) {
        super();
    }

    public start() {
        CommandHandler.load("./src/commands", ["general"], this);
        EventHandler.load("./src/events", this);
        import("../database/database");
        this.login(this.baseClient.token);
    }
}