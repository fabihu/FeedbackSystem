var LocalStrategy   = require('passport-local').Strategy;
var utils = require('../models/utils');
var dbhandler = require('../db/dbhandler');

module.exports = function(passport) {


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
   
    passport.deserializeUser(function(id, done) {
    dbhandler.pool.getConnection(function(err, connection) {
        connection.query("select * from users where id = "+id,function(err,rows){
            if(err){
                console.log(err);
            }   
            done(err, rows[0]);           
        });
        connection.release();
    });

    });
   
    passport.use('local-login', new LocalStrategy({       
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 
     dbhandler.pool.getConnection(function(err, connection) {        
         connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
            if (err){
                console.log(err);               
                return done(err);
            }
            if (!rows.length) {                        
                return done(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 
            } 
            
           var hash = rows[0].password;
          
            if (!(utils.comparePassword(password, hash))){               
                return done(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 
            }
           
            return done(null, rows[0]);         
        
        });
      connection.release();
      });
    }));

};