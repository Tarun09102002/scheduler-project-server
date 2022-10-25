const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./user-model')
const Meet = require('./meet-model')

const Notification = new mongoose.Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true },
    message: { type: String, required: true },
    meet: { type: Schema.Types.ObjectId, ref: 'Meet' },
})

const model = mongoose.model("Notification", Notification);
module.exports = model