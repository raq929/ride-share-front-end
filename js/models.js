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
      "address": ride.destination.address,
      "id": ride.id
    }


    });
  });

};


