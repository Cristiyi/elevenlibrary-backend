var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var db = require('./models/db');
var log = require('./models/log');
var domain = require('domain');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, ''));

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));

app.use(session({
  secret: 'elevenlibrary',
  rolling: false,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({
    url: 'mongodb://9.115.24.133/elevenlibrary',
    ttl: 7 * 24 * 60 * 60,
    autoRemove: 'native',
    touchAfter: 24 * 3600
  }),
}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  var views = req.session.views;
  console.log('session:', req.session);
  next();
});

app.use(function(req, res, next) {
  var reqDomain = domain.create();
  reqDomain.on('error', function(error) {
    log.create({
      url: req.originalUrl,
      req: req.body,
      err: error.stack
    });
    fs.appendFile('log.log', Date() + ' | ' + req.originalUrl + ' | ' + JSON.stringify(req.body) + ' | ' + error.stack + '\n');
    console.log("Error req:", req.originalUrl, req.body, error.stack);
    res.status(500).send(error.stack);
  });
  reqDomain.run(next);
});

require('./routes/admin/books')(app);
require('./routes/admin/events')(app);
require('./routes/admin/logs')(app);
require('./routes/user/books')(app);
require('./routes/login/login')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
