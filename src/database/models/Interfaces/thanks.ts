import { Snowflake } from "discord.js";
import { Document } from "mongoose";

export default interface thanks extends Document {
    uId: Snowflake;
    thanks?: number; 
    cooldown?: number;
}