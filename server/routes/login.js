// load all the things we need


//connection.query('USE database');	

// expose this function to our app using module.exports
module.exports = function(passport) {
    var express = require('express');
    var router = express.Router();    
 
      // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    router.get('/', function(req, res) {      
        res.render('login.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    router.post('/try-login', passport.authenticate('local-login', {        
        successRedirect : '/eval', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

return router;
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}