var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
 tableName: 'users',
  hasTimestamps: false,

  links: function() {
    return this.hasMany(Link);
  },

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var password = model.attributes.password;

      bcrypt.hash(password, null, null, function(err, hash){
        if(err){
          console.log('there is a problem with your password', err);
        } else {
          model.set('passalt', hash);
        }
      });

 //   //set attrs.username to something
      //pass password through bcrypt
        //then model.set('passalt' to be the result from above)
 //     var shasum = crypto.createHash('sha1');
 //      shasum.update(model.get('url'));
 //      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }



  // initialize
});

module.exports = User;

// //   clicks: function() {
//     return this.hasMany(Click);
//   },
