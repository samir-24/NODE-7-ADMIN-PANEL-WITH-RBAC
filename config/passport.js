const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Admin = require('../models/adminModel');

passport.use(new LocalStrategy(
{
    usernameField: "email"
},
async (email, password, done) => {

    try {

        let user = await Admin.findOne({ email });

        console.log("User:", user);

        if (!user) {
            console.log("User not found");
            return done(null, false);
        }

        let checkPassword = await bcrypt.compare(password, user.password);

        console.log("Entered Password:", password);
        console.log("Database Password:", user.password);
        console.log("Password Match:", checkPassword);

        if (!checkPassword) {
            console.log("Password incorrect");
            return done(null, false);
        }

        return done(null, user);

    } catch (err) {
        return done(err);
    }

}));

passport.serializeUser((user,done)=>{

    done(null,user.id);

});

passport.deserializeUser(async(id,done)=>{

    try{

        let user = await Admin.findById(id);

        console.log("DESERIALIZE:",user);

        done(null,user);

    }catch(err){

        console.log(err);
        done(err);

    }

});

module.exports = passport;