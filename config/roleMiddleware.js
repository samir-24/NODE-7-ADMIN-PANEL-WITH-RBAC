module.exports.checkRole = (...roles) => {

    return (req,res,next)=>{

        if(!req.isAuthenticated()){
            return res.redirect('/login');
        }


        if(!req.user){
            req.flash('error','Please Login');
            return res.redirect('/login');
        }


        if(!roles.includes(req.user.role)){
            req.flash('error','Access Denied');
            return res.redirect('/');
        }


        next();
    }

}