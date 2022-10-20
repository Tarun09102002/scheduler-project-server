const mongoose = require('mongoose');
const { Schema } = mongoose;
const Event = require('./event-model')

const User = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    events: { type: [{ type: Schema.Types.ObjectId, ref: 'Event' }], default: [] }
})

const model = mongoose.model("User", User);
module.exports = model