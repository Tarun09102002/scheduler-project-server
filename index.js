const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user-model');
const Event = require('./models/event-model');
const bcrypt = require('bcryptjs');
const appController = require('./controller/appController');

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
    origin: process.env.CLIENT_URL,
    credentials: true
}));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/register', appController.register_user);

app.post('/login', appController.login_user);

app.post('/googlelogin', appController.google_login);

app.delete('/delete/:id', appController.delete_event);

app.get('/tasks/:userid', appController.fetch_user_events);

app.put('/edit/tasks/:id', appController.edit_event);

app.post('/add/tasks/:id', appController.add_event);

app.get('/specifictask/:id', appController.fetch_specific_event);

app.put('/complete/:id', appController.complete_event);


