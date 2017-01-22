var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var helmet = require('helmet')
var flash    = require('connect-flash');
var session = require('express-session');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var config = require('./config/config');
var port = config.port;
require('./models/passport')(passport);

var index = require('./routes/index')(io);
var eval = require('./routes/eval')();
var users = require('./routes/users');
var login = require('./routes/login')(passport);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: config.session.secret,
                  resave: config.session.resave, 
                  saveUninitialized: config.session.saveUninitialized}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.use('/', index);
app.use('/eval', eval);
app.use('/users', users);
app.use('/login', login);
app.get('*', function(req, res){
  res.render('404');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');  
  err.status = 404;
  console.log(req.url); 
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  console.error(err.stack);
  
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



server.listen(port)
module.exports = app;

