var rsapi = {

  rs: 'https://glacial-atoll-7078.herokuapp.com',
  //rs: 'http://localhost:3000',

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
      url: this.rs + '/logout/' + user.id,
      headers: {
        Authorization: 'Token token=' + user.token
      }
    }, callback);
  },

  createRide: function(data, callback){
    this.ajax({
      method: 'POST',
      url: this.rs + '/rides',
      headers: {
        Authorization: 'Token token=' + user.token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data),
      dataType: 'json'
    }, callback);
  },

  editRide: function(data,  rideId,  callback){
    this.ajax({
      method: 'PATCH',
      url: this.rs + '/rides/' + rideId,
      headers: {
        Authorization: 'Token token=' + user.token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data),
      dataType: 'json'
    }, callback);
  },

  deleteRide: function(rideId,  callback){
    this.ajax({
      method: 'DELETE',
      url: this.rs + '/rides/' + rideId,
      headers: {
        Authorization: 'Token token=' + user.token,
      },
      dataType: 'json'
    }, callback);
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
  },


  joinRide: function(rideId, callback){
    var data = {ride_id: rideId};
    this.ajax({
      method: 'POST',
      url: this.rs + '/ride_passengers',
      headers: {
        Authorization: 'Token token=' + user.token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data),
      dataType: 'json'
    }, callback);
  },

  leaveRide: function(rideId, callback){
    var data = {ride_id: rideId};
    this.ajax({
      method: 'DELETE',
      url: this.rs + '/ride_passengers',
      headers: {
        Authorization: 'Token token=' + user.token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data),
      dataType: 'json'
    }, callback);
  }
};
