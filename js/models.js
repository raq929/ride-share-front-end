var User = function(id, token){
  this.id = id;
  this.token = token;
};

var Rides = function(ridesData) {
  this.rides=ridesData;
  this.date = Date.now();

};

Rides.prototype.getDestinations = function() {
  var d = this.rides.map(function(ride){
    return {id: ride.id, 
      lat: ride.destination.lat, 
      lng: ride.destination.lng
    };
  });
  return d;
};

Rides.prototype.getAddresses = function(){
  var a = this.rides.map(function(ride){
    return {
      id: ride.id,
      destination: ride.destination.address,
      start_point: ride.start_point.address
    };
  });
  return a;
};

Rides.prototype.seatsLeft = function(){
  this.rides.forEach(function(ride){
    seatsLeft = ride.spots_available - ride.passengers.length;
    console.log("Seats left " + seatsLeft);
    if (seatsLeft >= 0){
      ride.seats_left = seatsLeft;
    }
  });

  
};

Rides.prototype.refresh = function(){
  var now = Date.now;
  if (now - this.date >= 10000){
      rsapi.getRides(ridesCallback);
    }
};

Rides.prototype.isOwner = function(){
  if (user) {
    this.rides.forEach(function(ride){
      if (user.id === ride.owner.id){
        ride.isOwner = true;
      } else {
        ride.isOwner = false;
      }
    });
  }
};
  


