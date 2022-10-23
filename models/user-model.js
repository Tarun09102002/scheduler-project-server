const mongoose = require('mongoose');
const { Schema } = mongoose;
const Event = require('./event-model')
const Meet = require('./meet-model')

const User = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    events: { type: [{ type: Schema.Types.ObjectId, ref: 'Event' }], default: [] },
    imageUrl: { type: String, required: false },
    meets: { type: [{ type: Schema.Types.ObjectId, ref: 'Meet' }], default: [] },
    pendingMeets: { type: [{ type: Schema.Types.ObjectId, ref: 'Meet' }], default: [] },
    notifications: { type: Array, default: [] }
})

const model = mongoose.model("User", User);
module.exports = model