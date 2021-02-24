var createError = require('http-errors');
var express = require('express');
var path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var hbs = require('express-handlebars');
dotenv.config({ path: './.env' });

var app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST, // 배포할 땐 그 ip주소 입력
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  key: 'sid',
  secret: 'secretTetris',
  resave: false,
  saveUninitialized: true,
  cookie:{
      maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
  }
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

db.connect( (error)=>{
  if(error){
      console.log(error);
  }else{
      console.log("MYSQL Connected...");
  }
});

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error - Tetris Battle',
    session: req.session,
  });
});

module.exports = app;
