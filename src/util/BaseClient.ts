import { Client, ClientOptions } from "discord.js";
import baseClient from "../Interfaces/BaseClient";

export default class BaseClient extends Client {
    constructor(public baseClient: baseClient, public BaseOptions?: ClientOptions) {
        super();
    }

    public start() {
        import("../database/database");
        this.login(this.baseClient.token);
        
    }
}