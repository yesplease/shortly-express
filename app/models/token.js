var db = require('../config');
var User = require('./user');
var crypto = require('crypto');

var Token = db.Model.extend({
  tableName: 'token',
  hasTimestamps: true,
  defaults: {
    expires: 24
  },
  user: function(){
    return this.belongsTo(User, 'user_id');
  },

  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var shasum = crypto.createHash('sha1');
      shasum.update(Math.random().toString());
      model.set('token', shasum.digest('hex').slice(0, 20));
      console.log("model's token set to: ", model.get('token'));
    });
  }
});

module.exports = Link;
