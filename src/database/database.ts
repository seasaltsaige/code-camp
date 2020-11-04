import { connect } from "mongoose";

connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) throw err;
    else console.log("Successfully connected to the mongoose database");
})