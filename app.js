const express = require('express')

const port = process.env.PORT || 8080;

require('./config/db');

require('./config/passport');

// const cookieParser = require('cookie-parser');

const session = require('express-session');

const flash = require('connect-flash');

const passport = require('passport');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(session({

    secret: "adminpanel",

    resave: false,

    saveUninitialized: false,

    cookie: {

        maxAge: 1000 * 60 * 60 * 24,

        httpOnly: true

    }

}));

app.use(flash());

app.use(express.static('public'));

// app.use(cookieParser());

app.use(passport.initialize());

app.use(passport.session());

app.get("/test-session", (req, res) => {
    req.session.username = "admin";
    res.json(req.session);
});

app.use((req, res, next) => {

    res.locals.success = req.flash('success');

    res.locals.error = req.flash('error');

    next();

});
app.use('/', require('./routes/adminRoutes'));

app.use('/category', require('./routes/categoryRoutes'));

app.use('/subCategory', require('./routes/subCategoryRoutes'));

app.use('/extraCategory', require('./routes/extraCategoryRoutes'));

app.use('/product', require('./routes/productRoutes'));


app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log(`Server Running On Port ${port}`);
        console.log(`http://localhost:${port}`);
    }
})
