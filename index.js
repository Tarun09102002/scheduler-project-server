const express = require('express');
const multer = require('multer');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user-model');
const Event = require('./models/event-model');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const appController = require('./controller/appController');

const dest = '../client/public/uploads';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + file.originalname.toLowerCase().split(' ').join('-'));
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.log(err));

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/register', upload.single('Image'), appController.register_user); //atman

app.post('/login', appController.login_user); //atman

app.post('/googlelogin', appController.google_login); //atman

app.get('/image/profile/:filename', appController.get_profile_image); //tarun

app.get('/user/image/:id', appController.get_image_src); //tarun

app.delete('/delete/:id', appController.delete_event); //vyom

app.get('/tasks/:userid', appController.fetch_user_events); //vyom

app.put('/edit/tasks/:id', appController.edit_event); //atman

app.post('/add/tasks/:id', appController.add_event); //atman

app.post('/add/meet/:id', appController.add_meet); //atman 6

app.get('/specifictask/:id', appController.fetch_specific_event); //tarun

app.put('/complete/:id', appController.complete_event); //tarun

app.get('/meet/invites/:userid', appController.fetch_user_meet_invites); //vyom

app.post('/meet/accept/:userid', appController.accept_meet_invite); //vyom
app.post('/meet/reject/:userid', appController.reject_meet_invite); //vyom 5

app.get('/user/notifications/:userid', appController.fetch_user_notifications); //tarun

app.post('/user/clearnotification/:userid', appController.clear_notification); //tarun 6