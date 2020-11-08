import { Schema, model } from "mongoose";
import rank from "./Interfaces/rank";

const Rank = new Schema({
    gId: { type: String, required: true },
    uId: { type: String, required: true },

    stats: { type: Object, default: { level: 1, currXp: 0, reqXp: 500, totalXp: 0 } },
});

export default model<rank>("ranks", Rank);