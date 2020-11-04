import BaseClient from "../util/BaseClient";
import readdir from "readdir-plus";
import BaseEvent from "../util/BaseEvent";

export default new class EventHandler {
    load(path: string, client: BaseClient) {
        readdir(path, async (err, files) => {
            for (const file of files) {
                if (err) throw err;

                try {
                    // Import the event
                    const { default: Event } = await import(file.path);

                    // Make a new instance of that event.
                    const event = <BaseEvent>new Event()

                    // Set the client to listen to that event.
                    client.on(event.name, event.run.bind(null, client));
                    console.log(`Successfully loaded: ` + `${file.basename.toLowerCase()}`);
                } catch (err) {
                    console.log(err);
                }
            }
        });
    }
}