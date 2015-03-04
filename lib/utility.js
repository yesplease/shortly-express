var request = require('request');
var bcrypt = require('bcrypt-nodejs');


exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;
exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};


/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.hashPass = function(password, callback){
  bcrypt.hash(password, null, null, function(err, hash){
    if(err){
      console.log('there is a problem with your password', err);
    }
    callback(hash);
  });
};

exports.checkSession = function(req, callback){
  //check for sessionID
  var username = req.session.username;
  var sessionNum = req.sessionID;

  var sess = new User({username: username});
      //if false -> render(login)
      //if true -> grab username and sessionIS from cookie
        //test if session matches user && session is not expired
          //true -> render page
          //false -> login page
};

exports.startSession = function(req, res, newUser){
  req.session.regenerate(function(){
    req.session.user = newUser;
    res.redirect('/');
  });
};

exports.checkUser = function(req, res, next){
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
};
