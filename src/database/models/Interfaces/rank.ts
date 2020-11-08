import { Snowflake } from "discord.js";
import { Document } from "mongoose";

export default interface rank extends Document {
    gId: Snowflake;
    uId: Snowflake;

    stats?: {
        totalXp: number;
        level: number;
        currXp: number;
        reqXp: number;
    };
}