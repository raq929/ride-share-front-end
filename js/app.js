var rsHelpers = {
  wrap: function (root, formData) {
    var wrapper = {};
    wrapper[root] = formData;
    return wrapper;
  },

  form2object: function(form) {
    var data = {};
    $(form).find('input').each(function(index, element) {
      var type = $(this).attr('type');
      if ($(this).attr('name') && type !== 'submit' && type !== 'hidden') {
        data[$(this).attr('name')] = $(this).val();
      }
    });
    if(data.daddress){
      data.destination = {
        lat: data.dlat,
        lng: data.dlng,
        address:  data.daddress
      };
      data["start_point"] = {
        lat: data.slat,
        lng: data.slng,
        address: data.saddress
      };
    }
    return data;
  }
};


var user;
var rides;
var rideLine;

var setLocationClickHandlers = function(locations, map){
  locations.eachLayer(function(locale) {
    // find the div with the same id as the layer
    var prop = locale.feature.properties;
    id = prop.id;
    rideDiv = $("#ride" + id);
    var ride = rides.findById(id);

    rideDiv.on('click',function() {
      // clear any previous rideLine from the map
      if(rideLine){
        map.removeLayer(rideLine);
      }
      
      var startLatLng = [parseFloat(ride.start_point.lng), parseFloat(ride.start_point.lat)];
      var destinationLatLng =  [locale._latlng.lng, locale._latlng.lat];

      console.log([(startLatLng[1] + destinationLatLng[1])/2,(startLatLng[0]+ destinationLatLng[0])/2]);
      //zoom to a point midway bewteen the start and destination
      map.setView([(startLatLng[1] + destinationLatLng[1])/2,(startLatLng[0]+ destinationLatLng[0])/2], 6);

      var featureLayer = L.mapbox.featureLayer().addTo(map);
      // adds start point and line to the map
      var geojson = [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": startLatLng
          },
          "properties": {
            "marker-color": "#ff8888"
          }
        }, {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
               startLatLng,
              destinationLatLng
            ]
          },
          "properties": {
            "stroke": "#3D5AD0",
            "stroke-opacity": 0.8,
            "stroke-width": 4
          }
        }
      ];
      // assigns start point and line to a variable so they can be accessed later
      rideLine = featureLayer.setGeoJSON(geojson);

      
      locale.on('click', function(e) {

        // 1. center the map on the selected marker.
        map.panTo(locale.getLatLng()); 
       

      });
    });
  });  
}; 




$(document).ready(function(){

  ridesListTemplate = Handlebars.compile($("#ridesList").html());
  editRideFormTemplate = Handlebars.compile($("#editRideForm").html());

  // Click Handlers
  // Shows Create Ride form
  $("#newRideButton").on('click', function(){
    $("#createRideForm").show();
  });

  // Compiles and displays edit ride form
  $("#ridesListHere").on('click', '.editRideButton', function(e){
    e.preventDefault();
    id = this.dataset.id;
    //find the ride with the id stored in the button. 
    ride = rides.findById(id);
    // Compile a form template using that data.
    // findById returns an array of one item, so pass that item to the template
    var newHTML = editRideFormTemplate(ride);
    $("#editRideFormGoesHere").html(newHTML);

  });

  //Sends api call for creating a ride 
  $("#createRideForm").submit(function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      } else {
        rsapi.getRides(ridesCallback);
        $("#createRideForm").hide();
      }
    };
    var data = rsHelpers.wrap("ride",rsHelpers.form2object(this));

    rsapi.createRide(data, cb);
  });

  // sends api call to edit a ride
  $("#editRideFormGoesHere").on('submit', "#editRideForm",function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      } else {
        $("#editRideFormGoesHere").html('');
        rsapi.getRides(ridesCallback);
      }
    };
    var rideId = this.dataset.id;
    var rideData = rsHelpers.wrap("ride",rsHelpers.form2object(this));
    // Add the current number of passengers to the seats left indicated by user. Put it in the correct format for the server.
    rideData.ride.spots_available = parseInt(rides.findById(rideId).numberOfPassengers) + parseInt(rideData.ride.seats_left);

  
    rsapi.editRide(rideData, rideId, cb);
  });

  // sets click handler for delete rides button
  $("#ridesListHere").on('click', ".deleteRideButton",function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      }
      else {
        rsapi.getRides(ridesCallback);
      } 
    }; 
    rideId = this.dataset.id;
    rsapi.deleteRide(rideId, cb);
  });

  // sets click handler for join rides button
  $("#ridesListHere").on('click', ".joinRideButton",function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      }
      else {
        rsapi.getRides(ridesCallback);
      } 
    }; 
    rideId = this.dataset.id;

    rsapi.joinRide(rideId, cb);
  });

  // sets click handler for  leaverides button
  $("#ridesListHere").on('click', ".leaveRideButton", function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      }
      else {
        rsapi.getRides(ridesCallback);
      } 
    }; 
    rideId = this.dataset.id;
   
    rsapi.leaveRide(rideId, cb);
  });
  
  // sets up mapBox 
  L.mapbox.accessToken = 'pk.eyJ1IjoicmFxOTI5IiwiYSI6ImNpaTYxZm9mMjAxa3R0eGtxY25reW12cXAifQ.g49YwXKsFMU2bcQDQdfaDw';
  // tells mapbox which tiles to use
  var map = L.mapbox.map('map', 'mapbox.streets');
  //sets the initial coordinates and zoom
  map.setView([42.3601,-71.0589], 7);
  // adds the geocoder 
  var geocoderControl = L.mapbox.geocoderControl('mapbox.places', {
        autocomplete: true
    });
  geocoderControl.addTo(map);
  //pipes geocoder results to an output window
  geocoderControl.on('found', function(res) {
    result = res.results.features[0];
    //defines which results are displated and how
    $("#output").html("<p id='foundAddress'>"+ result.place_name + 
      "</p><p id='foundLat'>Latitude: " +
      result.geometry.coordinates[1] +
      "</p><p id='foundLng'>Longitude: " + 
      result.geometry.coordinates[0]);
    
    
    $('#sendToDestination').show();
    $('#sendToStart').show();
  });


  //makes initial call to /rides
  var ridesCallback = function (error, data) {
    if (error){
      console.log(error);
    } else {
      rides = new Rides(data.rides);
      //get destinations for map
      destinations = rides.getDestinations();
      // sets additional properties on each ride
      // isOwner, isPassnger, seats_left, numberOfPassengers
      rides.setProperties();

      
      //compile handlebars template
      var newHTML = ridesListTemplate(rides);
      $("#ridesListHere").html(newHTML);

      //get GeoJson and put markers on the map
      rides.getDestinationGeoJSON();
      var locations = L.mapbox.featureLayer().addTo(map);
      locations.setGeoJSON(geoJSON);
      setLocationClickHandlers(locations, map);
    }
  };

  rsapi.getRides(ridesCallback);


  $('#loginForm').on('submit', function(e){
      e.preventDefault();
      var credentials = rsHelpers.wrap('credentials', rsHelpers.form2object(this));
      var cb = function (error, data) {
        if (error){
          console.log(error);
        }
        //hide login form and label
        $("#loginCheckbox").trigger('click');
        $("#loginLabel").css({display: 'none'});
        $('#message').text("You have logged in");
        // display logout and new ride button
        $('#logout').css({display: 'inline'});
        $('#newRideButton').show();
        //get rides
        rsapi.getRides(ridesCallback);
        
        user = new User(data.user.id, data.user.token);
      };

      rsapi.login(credentials, cb);
    });

   $('#registrationForm').on('submit', function(e) {
      e.preventDefault();
      var credentials = rsHelpers.wrap('credentials', rsHelpers.form2object(this));
      console.log(credentials);
      rsapi.register(credentials, function(err, data){
        if (err) {
          console.log(err);
        }
        else {
          $("#message").text("You have been registered!");
          $("#registrationCheckbox").trigger('click');
        }
      }
      );
     
   $('#logout').click(function(){
       alert("You clicked!");
      var cb = function(error, data){
        if (error) {
          $('#message').val('status: ' + error.status + ', error: ' +error.error);
  
        }  else {
          user = null;
        $('#logout').css({display: 'none'});
        $("#loginLabel").css({display: 'inline'});
        }
      };
      rsapi.logout(cb);
    });
});

});
