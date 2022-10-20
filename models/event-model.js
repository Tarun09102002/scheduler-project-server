const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user-model");

const EventModel = new mongoose.Schema({
    start: { type: String, required: true },
    end: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    color: { type: String, required: true },
    date: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
    user: { type: Schema.Types.ObjectId }
})


const model = mongoose.model("Event", EventModel);
module.exports = model
