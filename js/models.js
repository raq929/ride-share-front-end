var User = function(id, token){
  this.id = id;
  this.token = token;
};

var geoJSON = {
  "type": "FeatureCollection",
  "features":[]
};

var Rides = function(ridesData) {
  this.rides=ridesData;
  this.date = Date.now();

};

var initRideWindowData = function(rideId){
  data =  {
      moreClicked: false,
      rideClicked: false
    }; 

  rideWindowDataStorage[rideId] = data;
};
var rideWindowDataStorage = {};


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


Rides.prototype.refresh = function(){
  var now = Date.now;
  if (now - this.date >= 10000){
      rsapi.getRides(ridesCallback);
    }
};


Rides.prototype.findById = function(id){
  id = parseInt(id);
  return this.rides.filter(function(ride){
    
    return (ride.id === id);
  })[0];
};

Rides.prototype.setProperties = function(){
  if (user) {
    this.rides.forEach(function(ride){
      // sets the number of passengers on the ride
      ride.numberOfPassengers = ride.passengers.length;
      // sets the number of seats left
      seatsLeft = ride.spots_available - ride.passengers.length;
      if (seatsLeft >= 0){
        ride.seats_left = seatsLeft;
      } else {
        ride.seats_left = 0;
      }
      // determine whether the user is a passenger  
      if (ride.passengers.some(function(passenger){
        return passenger.id === user.id})) {
        ride.isPassenger = true;
      } else {
        ride.isPassenger = false;
      }
      //determine whether th user owns this ride
      if (user.id === ride.owner.id){
        ride.isOwner = true;
      } else {
        ride.isOwner = false;
      } 
    });
  }  
};

// "type": "FeatureCollection",
// "features": [
//   {
//     "type": "Feature",
//     "geometry": {
//       "type": "Point",
//       "coordinates": [
//         -77.034084142948,
//         38.909671288923
//       ]
//     },
//     "properties": {
//       "phoneFormatted": "(202) 234-7336",
//       "phone": "2022347336",
//       "address": "1471 P St NW",
//       "city": "Washington DC",
//       "country": "United States",
//       "crossStreet": "at 15th St NW",
//       "postalCode": "20005",
//       "state": "D.C."
//     }
//   }  

Rides.prototype.getDestinationGeoJSON = function(){
  this.rides.forEach (function(ride){
    geoJSON.features.push({

    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [ride.destination.lng, ride.destination.lat]
    },
    "properties": {
      "marker-color": "#0A42DD",
      "address": ride.destination.address,
      "id": ride.id
    }


    });
  });

};


