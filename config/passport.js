const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Admin = require('../models/adminModel');

passport.use(new LocalStrategy({

    usernameField : "email"

},async(email,password,done)=>{

    let user = await Admin.findOne({email : email});

    if(!user){
        return done(null,false);
    }

    let checkPassword = await bcrypt.compare(password,user.password);

    if(!checkPassword){
        return done(null,false);
    }

    return done(null,user);

}));

passport.serializeUser((user,done)=>{

    done(null,user.id);

});

passport.deserializeUser(async(id,done)=>{

    let user = await Admin.findById(id);

    done(null,user);

});

module.exports = passport;