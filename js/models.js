var User = function(id, token){
  this.id = id;
  this.token = token;
};

var Rides = function(ridesData) {
  this.rides=ridesData;
  this.date = Date.now();

};

Rides.prototype.getDestinations = function() {
  this.rides.map(function(ride){
    return {id: ride.id, 
      lat: ride.destination.lat, 
      lng: ride.destination.lng
    };
  });
};

Rides.prototype.getAddresses = function(){
  this.rides.map(function(ride){
    return {
      id: ride.id,
      destination: ride.destination.address,
      start_point: ride.start_point.address
    };
  });
};

Rides.prototype.refresh = function(){
  var now = Date.now;
  if (now - this.date >= 10000){
      rsapi.getRides(ridesCallback);
    }
};


