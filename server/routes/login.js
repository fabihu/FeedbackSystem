module.exports = function(passport) {
    var express = require('express');
    var router = express.Router();
    var dbhandler = require('../db/dbhandler');    
 
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
    router.post('/try-login', function(req, res){      
    req.session.input = req.body;

    dbhandler.dbIsRunning(function(running){  
        if(running){
            passport.authenticate('local-login', {        
                successRedirect : '/eval', // redirect to the secure profile section
                failureRedirect : '/login', // redirect back to the signup page if there is an error
                failureFlash : true // allow flash messages     
            })(req, res);
        } else {        
           res.render('login.ejs', { message: 'Dienst zur Zeit nicht verfügbar. Bitte benachrichtigen Sie den Administrator!' });
        }
    });
});    


return router;
};
