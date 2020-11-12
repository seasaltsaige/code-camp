import { Snowflake } from "discord.js";
import { Document } from "mongoose";
import Infraction from "../../../Interfaces/Infraction";
import Mute from "../../../Interfaces/Mute";

export default interface guild extends Document {
    gId: Snowflake;

    logChannel?: string | null;

    infractionNumber?: number;

    infractions?: Array<Infraction>;

    modRoles_Users?: Array<Snowflake>;

    muteRole?: Snowflake;

    mutedUsers?: Array<Mute>;

    welcomeInfo?: {
        id: Snowflake;
        message: string;
        rolesToAdd: Array<Snowflake>;
    };

    thankLB?: {
        cId: Snowflake;
        mId: Snowflake;
    };

    xpInfo?: {
        xpMulti: number;
        maxXP: number;
        baseXP: number;
        cooldown: number;
        message: string;
        levelingChannel: string;
        ignoredChannels: Snowflake[];
        ignoredUsers: Snowflake[];
    };

    counterInfo?: {
        parent: string;
        members: string;
        bots: string;
        users: string;
        channels: string;
    }
}