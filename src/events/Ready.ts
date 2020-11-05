
import BaseClient from "../util/BaseClient";
import BaseEvent from "../util/BaseEvent";

export default class Ready extends BaseEvent {
    constructor() {
        super({
            name: "ready",
            description: "Ready event",
        });
    }
    async run (client: BaseClient) {
        console.log(`Logged in as ${client.user.username} into ${client.guilds.cache.size} server(s)`);
    }
}