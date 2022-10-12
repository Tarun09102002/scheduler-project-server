const bcrypt = require('bcryptjs');
const User = require('../models/user-model');
const Event = require('../models/event-model');


exports.register_user = async (req, res) => {
    console.log("here")
    const { Username, Password } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    await User.create({ username: Username, password: hashedPassword }).catch(err => console.log(err));
    res.send('User created');
}

exports.login_user = async (req, res) => {
    console.log("here")
    const { Username, Password } = req.body;
    const user = await User.findOne({ username: Username }).catch(err => console.log(err));
    if (!user) {
        console.log('invalid')
        res.status(200).send({ message: 'unsuccessful' });
    }
    else {
        const validPassword = await bcrypt.compare(Password, user.password);
        if (validPassword) {
            console.log('here')
            res.status(200).send({ message: 'successful', token: user.id });
            // res.send({ message: 'successful', token: user.id }, 200);
        }
        else {
            console.log('invalid')
            res.status(200).send({ message: 'unsuccessful' });
        }
    }
}

exports.delete_event = async (req, res) => {
    const id = req.params.id;
    const event = await Event.findByIdAndDelete(id).catch(err => console.log(err));
    const user = await User.findByIdAndUpdate(event.user, { $pull: { events: event._id } }).catch(err => console.log(err));
    res.send('Event deleted');
}

exports.fetch_user_events = async (req, res) => {
    const { userid } = req.params;
    const { date } = req.query;
    console.log(userid, date)
    const user = await User.findById(userid)
        .populate('events')
        .catch(err => console.log(err));
    const events = user.events.filter(event => event.date === date);
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        res.status(200).send(events);
    }
}

exports.edit_event = async (req, res) => {
    console.log(req.body)
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body).catch(err => console.log(err));
    await event.save();
    res.send('Event updated');
}

exports.add_event = async (req, res) => {
    const { id } = req.params;
    const event = await Event.create({ ...req.body, user: id }).catch(err => console.log(err));
    const user = await User.findById(id).catch(err => console.log(err));
    user.events.push(event.id);
    await user.save();
    return res.send('Event added');
}

exports.fetch_specific_event = async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id).catch(err => console.log(err));
    if (!event) {
        res.status(404).send('Event not found');
    }
    else {
        res.status(200).send(event);
    }
}

exports.complete_event = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    console.log(completed)
    const event = await Event.findById(id).catch(err => console.log(err));
    if (!event) {
        res.status(404).send('Event not found');
    }
    else {
        event.completed = completed ? true : false;
        await event.save();
        res.status(200).send('Event completed');
    }
}