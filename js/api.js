var rsapi = {

  //rs: 'https://mighty-shelf-9974.herokuapp.com',
  rs: 'http://localhost:3000',

  ajax: function(config, cb) {
    $.ajax(config).done(function(data, textStatus, jqxhr) {
      cb(null, data);
    }).fail(function(jqxhr, status, error) {
      cb({jqxher: jqxhr, status: status, error: error});
    });
  },

  register: function (credentials, callback) {
    this.ajax({
      method: 'POST',
      url: this.rs + '/register',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(credentials),
      dataType: 'json'
    }, callback);
  },

  login: function (credentials, callback) {
    this.ajax({
      method: 'POST',
      url: this.rs + '/login',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(credentials),
      dataType: 'json'
    }, callback);
  },

  logout: function(callback) {
    this.ajax({
      method: 'DELETE',
      url: this.rs + '/logout/' + user.userID,
      headers: {
        Authorization: 'Token token=' + user.currentToken
      }
    }, callback);
  },

  geocode: function(text){
    this.ajax({
      method:'GET',
      url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + text + ".json?access_token=<pk.eyJ1IjoicmFxOTI5IiwiYSI6ImNpaTYxZm9mMjAxa3R0eGtxY25reW12cXAifQ.g49YwXKsFMU2bcQDQdfaDw"
    });
  },

  getRides: function (callback) {
    this.ajax({
      method: 'GET',
      url: this.rs + '/rides',
      headers: {
        "Content-Type": "application/json"
      },
      dataType: 'json'
    }, callback);
  }
  
};
