var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'shhh, very secret'
}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));


app.get('/login',
  function(req, res) {
    res.render('login');
  });

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/login');
  });
});

app.get('/', util.checkUser,
function(req, res) {
  res.render('index'); //NOTE: Could not use '/index'but had to use 'index'
});

app.get('/create', util.checkUser,
function(req, res) {
  res.render('create');
});

app.get('/links', util.checkUser,
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.get('/signup',
  function(req, res) {
    res.render('signup');
  });

app.post('/login',
  function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var hash = '';
    new User({username:username}).fetch()
    .then(function(model){
      if(!model){
        return res.redirect('/signup');
      }
      hash = model.get('passalt');
      var userID = model.get('id');
      // console.log("This is the passalt: ", hash);
      bcrypt.compare(password, hash, function(err, result){
        if (err){
          console.log("This is the error: ", err);
        }
        if (result){
          console.log("passwords match");
          util.startSession(req, res, model);
        }

        if (!result){
          console.log("passwords don't match");
          res.redirect('/signup');
        }
      });
    });
  });

app.post('/signup',
  function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    new User({username: username}).fetch().then(function(found) {
      if(found){
        res.send(418, 'username already exists, please login');
      } else {
        console.log("About to hash pwd on new user");
        util.hashPass(password, function(hash){
          var user = new User({
            username: username,
            passalt: hash
          });

          user.save().then(function(newUser){
            Users.add(newUser);
            util.startSession(req, res, newUser);
            // res.render('/index');
          });
        });
      }
    });
  });


app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          user_id: req.session.user,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      console.log("this is the req params[0]", req.params[0]);
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
