import { Schema, model } from "mongoose";
import guild from "./Interfaces/guild";

const Guild = new Schema({
    gId: { type: String, required: true },

    logChannel: { type: String, default: null },
    infractionNumber: { type: Number,  default: 1 },
    infractions: { type: Array,  default: [] },
    modRoles_Users: { type: Array, default: [] },
    muteRole: { type: String, default: "" },
    mutedUsers: { type: Array, default: [] },
    welcomeInfo: { type: Object, default: null },
});

export default model<guild>("guild", Guild);