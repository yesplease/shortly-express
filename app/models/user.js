var db = require('../config');
var Promise = require('bluebird');

var User = db.Model.extend({
 tableName: 'users',
  hasTimestamps: false,

  links: function() {
    return this.hasMany(Link);
  },
  token: function(){
    return this.hasOne(Token);
  },

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var password = model.attributes.password;

      bcrypt.hash(password, null, null, function(err, hash){
        if(err){
          console.log('there is a problem with your password', err);
        } else {
          //model.set('passalt', hash); old way
          model.set('passalt', hash); //new way
        }
      });

    });
  }
});

module.exports = User;

      // var shasum = crypto.createHash('sha1');
      // shasum.update(model.get('url'));
      // model.set('code', shasum.digest('hex').slice(0, 5));
