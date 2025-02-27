const User = require('../models/user');


module.exports.renderRegister =  (req,res)=> {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // Registers the user
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to YELP CAMP!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (Req,res) => {
    res.render('users/login')
}

module.exports.login = (req,res) => {
    console.log(req.user);
    req.flash('success', 'Welcome Back!!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}