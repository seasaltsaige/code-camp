import { Document } from "mongoose";

export default interface autoRole extends Document {
    msgId: string;
    chId: string;
    data?: {
        emoji: {
            id: string;
        };
        role: string;
    }[];
}