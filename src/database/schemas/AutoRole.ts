import { Schema, model } from "mongoose";
import autoRole from "./Interfaces/autoRole";

const AutoRole = new Schema({
    msgId: { type: String, required: true },
    chId: { type: String, required: true },
    data: { type: Array, required: false, default: [] },
});

export default model<autoRole>("autorole", AutoRole);