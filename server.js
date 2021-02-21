require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const methodOverride = require('method-override');

// Auth
const session = require('express-session'); // Ok we use this to monitor when someone is "logged in" and when they "logout".
const flash = require('connect-flash'); // This communicates to the user when there are errors or success
const passport = require('./config/ppConfig');

// Real Time Processes
const socketio = require('socket.io');

// Other Middleware

app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'));

// Seesion Middleware
const SECRET_SESSION = process.env.SECRET_SESSION;

// secret: what we actually will be giving to the user on our site as a session coookie
// resave: Save the session even if it's modified, make this false.
// saveUninitialized: If we have a new session, we save it, therefore making it true
const sessionObject = {
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}
app.use(session(sessionObject));

// Passport Middleware
app.use(passport.initialize()); // Starts the password
app.use(passport.session()); // Adds a session

// Flash Middleware
app.use(flash());
app.use((req, res, next) => {
  // console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// BUT WAIT, THERE'S more MIDDLEWARE in the middleware folder

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/auth', require('./routes/auth'));
app.use('/feed', require('./routes/feed'));
app.use('/users', require('./routes/users'));
app.use('/flocks', require('./routes/flocks'));
app.use('/posts', require('./routes/posts'));

// Unknown get routes.
app.get('*', (req, res) => {
  req.flash('error', "Page does not exist.");
  res.status(404).redirect('/');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Crane is Running on port: ${PORT}`);
});

// Real time socket connections
const SOCKET_URL = process.env.SOCKET_URL || "http://127.0.0.1:3000/";
const io = socketio(server, {
  cors: {
      origin: SOCKET_URL,
  },
});

module.exports = server;
