import { ClientEvents } from 'discord.js';
import BaseClient from "./BaseClient";
import EventDataResolvable from '../Interfaces/EventDataResolvable';

export default abstract class BaseEvent {
    constructor(private eventData: EventDataResolvable) {};

    public get name(): keyof ClientEvents { return this.eventData.name }
    public get description(): string { return this.eventData.description }

    public abstract run(client: BaseClient, ...args: any): void
}