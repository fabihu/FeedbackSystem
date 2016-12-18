var LocalStrategy   = require('passport-local').Strategy;
var utils = require('../models/utils');
var dbhandler = require('../db/dbhandler');

module.exports = function(passport) {
dbhandler.pool.getConnection(function(err, connection) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
   
    passport.deserializeUser(function(id, done) {
        connection.query("select * from users where id = "+id,function(err,rows){   
            done(err, rows[0]);
        });
    });
   
    passport.use('local-login', new LocalStrategy({       
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {         
         connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
            if (err)
                return done(err);
             if (!rows.length) {               
                return done(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 
            } 
            
           var hash = rows[0].password;
          
            if (!(utils.comparePassword(password, hash)))
                return done(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 

            return done(null, rows[0]);         
        
        });
        


    }));
});
};