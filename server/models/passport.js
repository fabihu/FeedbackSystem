//module for the authentification process
var LocalStrategy   = require('passport-local').Strategy;
var utils = require('../models/utils');
var dbhandler = require('../db/dbhandler');

//login adapted from https://github.com/jaredhanson/passport-local
module.exports = function(passport) {
    passport.serializeUser(function(user, callback) {
        callback(null, user.id);
    });   
    passport.deserializeUser(function(id, callback) {
        dbhandler.pool.getConnection(function(err, connection) {
            connection.query("SELECT * FROM users WHERE id = "+id, function(err,rows){
                if(err){
                    console.log(err);
                }   
                callback(err, rows[0]);           
            });
            connection.release();
        });
    });
    //strategy to use for authentication process   
    passport.use('local-login', new LocalStrategy({       
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, callback) { 
     dbhandler.pool.getConnection(function(err, connection) {        
        connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
            if (err){
                console.log(err);               
                return callback(err);
            }
            if (!rows.length) {                        
                return callback(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 
            }            
            var hash = rows[0].password;          
            if (!(utils.comparePassword(password, hash))){               
                return callback(null, false, req.flash('loginMessage', 'Passwort oder Benutzername falsch!')); 
            }
            return callback(null, rows[0]);        
        });
      connection.release();
      });
    }));

};