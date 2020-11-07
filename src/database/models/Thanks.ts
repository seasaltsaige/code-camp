import { Schema, model } from "mongoose";
import thanks from "./Interfaces/thanks";

const Thanks = new Schema({

    uId: { type: String, required: true },
    thanks: { type: Number, required: false, default: 0 },

    cooldown: { type: Number, required: false, default: 0 },
});

export default model<thanks>("thanks", Thanks);