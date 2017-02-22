var config = {};
config.host = 'hostname';
config.port = 8080;

config.db ={};
config.db.host = 'localhost';
config.db.user = 'root';
config.db.password = '';
config.db.database = 'database';

config.session = {};
config.session.secret = 'keyboardcat';
config.session.resave = true;
config.session.saveUninitialized = true; 

module.exports = config;
