const bcrypt = require('bcryptjs');
const User = require('../models/user-model');
const Event = require('../models/event-model');
const Meet = require('../models/meet-model');


exports.register_user = async (req, res) => {
    let url = ''
    if (req.file) {
        url = req.protocol + "://" + req.get('host') + "/image/profile/" + req.file.filename
    }
    const { Username, Email, Name, Password } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    const user = await User.findOne({ username: Username }).catch(err => console.log(err));
    if (user) {
        res.status(200).send({ message: 'unsuccessful' });
    }
    else {
        await User.create({ username: Username, password: hashedPassword, name: Name, email: Email, imageUrl: url }).catch(err => console.log(err));
        res.send('User created');
    }
}

exports.get_image_src = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id).catch(err => console.log(err));
    res.status(200).send(user.imageUrl);
}

exports.get_profile_image = async (req, res) => {
    const { filename } = req.params;
    res.sendFile(filename, { root: '../client/public/uploads' });
}

exports.login_user = async (req, res) => {
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

exports.google_login = async (req, res) => {
    console.log(req.body)
    const { Username, Name, Email, Password, ImageUrl } = req.body;
    console.log(ImageUrl)
    const user = await User.findOne({ username: Username }).catch(err => console.log(err));
    if (user) {
        res.status(200).send({ message: 'successful', token: user._id });
    }
    else {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const userNew = await User.create({ username: Username, password: hashedPassword, name: Name, email: Email, imageUrl: ImageUrl }).catch(err => console.log(err));
        res.status(200).send({ message: 'successful', token: userNew._id });
    }
}

exports.delete_event = async (req, res) => {
    const id = req.params.id;
    let event = await Event.findById(id).catch(err => console.log(err));
    if (event) {
        event = await Event.findByIdAndDelete(id).catch(err => console.log(err));
        const user = await User.findByIdAndUpdate(event.user, { $pull: { events: event._id } }).catch(err => console.log(err));
    }
    else {
        const meet = await Meet.findById(id).catch(err => console.log(err));
        if (meet) {
            const user = await User.findByIdAndUpdate(meet.createdby, { $pull: { meets: meet._id } }).catch(err => console.log(err));
            for (let i = 0; i < meet.participants.length; i++) {
                const user = await User.findByIdAndUpdate(meet.participants[i], { $pull: { meets: meet._id }, $pull: { pendingMeets: meet._id } }).catch(err => console.log(err));
            }

            await Meet.findByIdAndDelete(id).catch(err => console.log(err));
        }
    }
    res.send('Event deleted');
}

exports.fetch_user_events = async (req, res) => {
    const { userid } = req.params;
    const { date, month } = req.query;
    const user = await User.findById(userid)
        .populate('events')
        .populate('meets')
        .catch(err => console.log(err));
    if (!user) {
        res.status(404).send('User not found');
    }
    else {
        let events = [];
        let meets = [];
        if (date) {
            console.log('in date')
            events = await user.events.filter(event => event.date === date);
            meets = await user.meets.filter(meet => meet.date === date);
        }
        else if (month) {
            events = user.events.filter(event => {
                return event.date.substring(0, 7) === month
            })
            meets = user.meets.filter(meet => {
                return meet.date.substring(0, 7) === month
            })
        }
        res.status(200).send({ events, meets });
    }
}

exports.edit_event = async (req, res) => {
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


exports.add_meet = async (req, res) => {
    const { id } = req.params;
    const { participants } = req.body;
    const availableUsers = new Set();
    const unavailableUsers = []
    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const byusername = await User.findOne({ username: participant })
        const byemail = await User.findOne({ email: participant })
        if (!(byusername || byemail)) {
            unavailableUsers.push(participant)
        }
        else if (byusername) {
            availableUsers.add(byusername.id)
        }
        else {
            availableUsers.add(byemail.id)
        }
    }
    console.log(unavailableUsers)
    console.log(availableUsers)
    if (unavailableUsers.length > 0) {
        res.status(200).send({ message: 'unsuccessful', unavailableUsers });
    }
    else {
        const meet = await Meet.create({ ...req.body, createdby: id, participants: Array.from(availableUsers) }).catch(err => console.log(err));
        const user = await User.findById(id).catch(err => console.log(err));
        user.meets.push(meet.id);
        await user.save();
        availableUsers.forEach(async (participant) => {
            const userParticipant = await User.findById(participant).catch(err => console.log(err));
            userParticipant.pendingMeets.push(meet.id);
            userParticipant.notifications.push({ type: 'meet', meet: meet.id });
            await userParticipant.save();
        })
        res.status(200).send({ message: 'successful' });
    }
}

exports.update_user = async (req, res) => {
    console.log(req.file)
    res.send('done')
}

exports.fetch_specific_event = async (req, res) => {
    const { id } = req.params;
    let task = null;
    task = await Event.findById(id).catch(err => console.log(err));
    if (!task) {
        task = await Meet.findById(id).catch(err => console.log(err));
    }
    console.log(id)
    if (!task) {
        res.status(404).send('Event not found');
    }
    else {
        res.status(200).send(task);
    }
}

exports.complete_event = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    console.log(completed)
    const event = await Event.findById(id).catch(err => console.log(err));
    if (event) {
        event.completed = completed ? true : false;
        await event.save();
        res.status(200).send('Event completed');
    }
    else {
        const meet = await Meet.findById(id).catch(err => console.log(err));
        if (meet) {
            meet.completed = completed ? true : false;
            await meet.save();
            res.status(200).send('Meet completed');
        }
        else {
            res.status(404).send('Event not found');
        }
    }
}

exports.fetch_user_meet_invites = async (req, res) => {
    const { userid } = req.params;
    const user = await User.findById(userid);
    if (user) {
        const meets = await Meet.find({ _id: { $in: user.pendingMeets } }).populate('createdby').populate('participants').catch(err => console.log(err));
        // console.log(meets)
        res.status(200).send(meets);
    }
    else {
        res.status(404).send('User not found');
    }
}

exports.accept_meet_invite = async (req, res) => {
    const { userid } = req.params;
    const { meetId } = req.body;
    console.log('here')
    console.log(userid)
    const user = await User.findById(userid);
    console.log(user)
    if (user) {
        const meet = await Meet.findById(meetId);
        console.log(meetId)
        if (meet) {
            await User.findByIdAndUpdate(userid, { $pull: { pendingMeets: meetId, notifications: { type: 'meet', meet: meetId } }, $push: { meets: meetId } }).catch(err => console.log(err));
            console.log(user.pendingMeets)
            return res.status(200).send('Meet accepted');
        }
        else {
            return res.status(404).send('Meet not found');
        }
    }
    else {
        return res.status(404).send('User not found');
    }
}

exports.reject_meet_invite = async (req, res) => {
    const { userid } = req.params;
    const { meetid } = req.body;
    const user = await User.findById(userid);
    if (user) {
        const meet = await Meet.findById(meetid);
        if (meet) {
            meet.participants = meet.participants.filter(id => id !== userid);
            await meet.save();
            user.pendingMeets = user.pendingMeets.filter(id => id !== meetid);
            await user.save();
            res.status(200).send('Meet rejected');
        }
        else {
            res.status(404).send('Meet not found');
        }
    }
}

exports.fetch_user_notifications = async (req, res) => {
    const { userid } = req.params;
    const user = await User.findById(userid);
    if (user) {
        // const notifications = await Notification.find({ _id: { $in: user.notifications } }).populate('meet').populate('event').catch(err => console.log(err));
        const notifications = await User.findById(userid)
        const tempNotification = []
        for (let i = 0; i < notifications.notifications.length; i++) {
            const notification = notifications.notifications[i];
            if (notification.type === 'meet') {
                const meet = await Meet.findById(notification.meet).populate('createdby').catch(err => console.log(err));
                tempNotification.push({ type: 'meet', meet })
            }
        }
        console.log(tempNotification)
        res.status(200).send(tempNotification);
    }
    else {
        res.status(404).send('User not found');
    }
}