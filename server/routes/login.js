module.exports = function(passport) {
    var express = require('express');
    var router = express.Router();
    var dbhandler = require('../db/dbhandler');
    var bouncer = require ("express-bouncer")(60000,60000,3);
  
    //bruteforce prevention with middleware express-bouncer
    bouncer.blocked = function (req, res, next, remaining){       
        var seconds = remaining / 1000;
        res.render('login.ejs', { message: 'Dienst nicht verfügbar. Sie haben zu viele Anmeldeversuche benötigt. Bitte warten Sie '+ seconds.toFixed(0) + ' Sekunden für einen erneuten Anmeldeversuch.' });
    };

    //request handler for endpoint '/login'
    router.get('/', function(req, res) {      
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    
    //routine to authenticate for the evaluation app,
    //check if db is running, auth on passport module 
    //handle the success or the failure of the login
    router.post('/try-login', bouncer.block, function(req, res){
        dbhandler.init();
        dbhandler.dbIsRunning(function(running){
            if(running){
                req.session.input = req.body;
                passport.authenticate('local-login', {        
                        successRedirect : '/eval', // redirect to the secure profile section
                        failureRedirect : '/login', // redirect back to the signup page if there is an error
                        failureFlash : true    
            })(req, res);
            } else {        
               res.render('login.ejs', { message: 'Dienst zur Zeit nicht verfügbar. Bitte benachrichtigen Sie den Administrator!' });
            }
        });
    },
  function(err, req, res, next) {    
    console.log(err);
    return res.send({'status':'err','message':err.message});
  });

return router;
};
