import { connect } from "mongoose";

connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    if (err) throw err;
    else console.log("Successfully connected to the mongoose database");
})