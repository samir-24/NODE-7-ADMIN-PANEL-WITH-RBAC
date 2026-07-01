const express = require('express')

const port = process.env.PORT || 8080;

require('./config/db');

require('./config/passport');

// const cookieParser = require('cookie-parser');

const session = require('express-session');

const passport = require('passport');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded());

app.use(session({

    secret: "adminpanel",

    resave: false,

    saveUninitialized: false,

    cookie: {

        maxAge: 1000 * 60 * 60 * 24,

        httpOnly: true

    }

}));

app.use(express.static('public'));

// app.use(cookieParser());

app.use(passport.initialize());

app.use(passport.session());

app.get("/test-session", (req, res) => {
    req.session.username = "admin";
    res.json(req.session);
});

app.use('/', require('./routes/adminRoutes'));

app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server Running On Port ${port}`);
        console.log(`http://localhost:${port}`);
    }
})
