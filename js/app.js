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
  },

  clearForms: function(){
    // clear new ride form
    $("#newStartAddress").val("");
    $("#newStartLng").val("");
    $("#newStartLat").val("");
    // clear edit ride form
    $("#editStartAddress").val("");
    $("#editStartLng").val("");
    $("#editStartLat").val("");
  }
};


var user;
var rides;
var rideLine;
var locations;
var previousLocations;
var map;

var setLocationClickHandlers = function(locations, map){
  
  locations.eachLayer(function(locale) {
    // find the div with the same id as the layer
    var prop = locale.feature.properties;
    id = prop.id;
    rideDiv = $("#ride" + id);
    var ride = rides.findById(id);

    rideDiv.on('click',function() {
      // store that this div was clicked, remove clicks from other rides
      rides.rides.forEach(function(ride){
        var id = ride.id;
        rideWindowDataStorage[id].rideClicked = false; 
      });
      rideWindowDataStorage[ride.id].rideClicked = true;


      // clear any previous rideLine from the map
      if(rideLine){
        map.removeLayer(rideLine);
      }
      
      var startLatLng = [parseFloat(ride.start_point.lng), parseFloat(ride.start_point.lat)];
      var destinationLatLng =  [locale._latlng.lng, locale._latlng.lat];

      rideLine = L.mapbox.featureLayer().addTo(map);
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
      rideLine.setGeoJSON(geojson);
      map.fitBounds(rideLine.getBounds());

    });
    // set info in popup 
    var popup = '<h3>Destination</h3><div>' + prop.daddress;
    locale.bindPopup(popup);
    
    locale.on('click', function(e) {

      // 1. center the map on the selected marker.
      map.setView(locale.getLatLng(), 16);
      locale.openPopup();
      return false;

    });
  });  
}; 

//makes initial call to /rides
  var ridesCallback = function (error, data) {
    if (error){
      console.log(error);
    } else {
      rides = new Rides(data.rides);
      //get destinations for map
      destinations = rides.getDestinations();
      // sets additional user-dependent properties on each ride
      // isOwner, isPassnger, seats_left, numberOfPassengers
      rides.setProperties();
      
      //compile handlebars template
      var newHTML = ridesListTemplate(rides);
      $("#ridesListHere").html(newHTML);

      //get GeoJson and put markers on the map
      rides.getDestinationGeoJSON();
      // set former locations to previous locations so they can be removed
      previousLocations = locations;
      if(previousLocations){
         map.removeLayer(previousLocations);
      }
     
      locations = L.mapbox.featureLayer().addTo(map);
     
      locations.setGeoJSON(geoJSON);
      setLocationClickHandlers(locations, map);

      $(document).ready(function(){
        // restores data from last refresh
        // initializes data store for new rides
        rides.rides.forEach(function(ride){
          id = ride.id;
         
          if (rideWindowDataStorage[id]){
            if (rideWindowDataStorage[id].moreClicked){
              $("#more" + id).toggleClass('hidden');
              $("#ride" + id).click();
            }
          } else {
            initRideWindowData(id);
          }
        });
      });
    }
  };




$(document).ready(function(){

  ridesListTemplate = Handlebars.compile($("#ridesList").html());
  editRideFormTemplate = Handlebars.compile($("#createEditRideForm").html());

 // sets up mapBox 
  L.mapbox.accessToken = 'pk.eyJ1IjoicmFxOTI5IiwiYSI6ImNpaTYxZm9mMjAxa3R0eGtxY25reW12cXAifQ.g49YwXKsFMU2bcQDQdfaDw';
  // tells mapbox which tiles to use
  map = L.mapbox.map('map', 'mapbox.streets');
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
      "</p><p >Latitude: " +
      "<span id='foundLat'>" + result.geometry.coordinates[1] +
      "</span></p><p >Longitude: <span id='foundLng'>" + 
      result.geometry.coordinates[0] + "</span></p>");
    
    
    $('#sendToDestination').show();
    $('#sendToStart').show();
    $('pre.ui-output').show();
  });


  
  // initial get rides request
  rsapi.getRides(ridesCallback);
  // set a timer to refresh rides list continuously
  var getRidesInterval = setInterval(rsapi.getRides(ridesCallback), 5000);

  // CLICK HANDLERS

  // Shows all rides 
  $("#showAll").on('click', function(){
     map.fitBounds(locations.getBounds());
  });

  // Shows Create Ride form
  $("#newRideButton").on('click', function(){
    $("#createRideForm").show();
  });

  // Compiles and displays edit ride form
  $("#ridesListHere").on('click', '.editRideButton', function(e){
    e.preventDefault();
    var id = this.dataset.id;
    //find the ride with the id stored in the button. 
    ride = rides.findById(id);
    // Compile a form template using that data.
    // findById returns an array of one item, so pass that item to the template
    var newHTML = editRideFormTemplate(ride);
    $("#editRideFormGoesHere").html(newHTML);
    // Hide the rides div
    $("#ridesListHere").hide();

  });

  //Sends api call for creating a ride 
  $("#createRideForm").submit(function(e){
    e.preventDefault();
    cb =function(err,data){
      if (err){
        console.log(err);
      } else {
        rsapi.getRides(ridesCallback);
        rsHelpers.clearForms();
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
        // clears edit form 
        $("#editRideFormGoesHere").html('');
        // shows rides list
        $("#ridesListHere").show();
        rsapi.getRides(ridesCallback);
      }
    };
    var rideId = this.dataset.id;
    var rideData = rsHelpers.wrap("ride",rsHelpers.form2object(this));
    // Add the current number of passengers to the seats left indicated by user. Put it in the correct format for the server.
    rideData.ride.spots_available = parseInt(rides.findById(rideId).numberOfPassengers) + parseInt(rideData.ride.seats_left);

  
    rsapi.editRide(rideData, rideId, cb);
  });

  // sends address data to forms
  $("#sendToDestination").on('click', function(){
    // get address info from output box
    address = $('#foundAddress').text();
    lat = $('#foundLat').text();
    lng = $('#foundLng').text();
    // send to new ride form
    $("#newDestinationAddress").val(address);
    $("#newDestinationLng").val(lng);
    $("#newDestinationLat").val(lat);
    // send to edit ride form
    $("#editDestinationAddress").val(address);
    $("#editDestinationLng").val(lng);
    $("#editDestinationLat").val(lat);
  });

  $("#sendToStart").on('click', function(){
    // get address info from output box
    address = $('#foundAddress').text();
    lat = $('#foundLat').text();
    lng = $('#foundLng').text();
    // send to new ride form
    $("#newStartAddress").val(address);
    $("#newStartLng").val(lng);
    $("#newStartLat").val(lat);
    // send to edit ride form
    $("#editStartAddress").val(address);
    $("#editStartLng").val(lng);
    $("#editStartLat").val(lat);
  });

  // sets click handler to cancel creating or editing a ride
  $("#cancelNewRide").on('click', function(){
    rsHelpers.clearForms();
    $("#createRideForm").hide();
  });

  $("#editRideFormGoesHere").on('click', "#cancelEditRide",function(){
    rsHelpers.clearForms();
    $("#ridesListHere").show();
    $('#editRideFormGoesHere').html("");
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

  // sets click handler for  leave rides button
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

 // click handler for More button
  $("#ridesListHere").on('click', ".showMoreButton", function(){
    // stores whether or not it has been clicked
    var id = this.dataset.id;
    var storage = rideWindowDataStorage[id];

    storage.moreClicked? storage.moreClicked = false : storage.moreClicked = true;
    // toggles hidden property of the div
    $("#more" + id).toggleClass('hidden');
    // changes the text of the button
    $("#more" + id + "button").val() === "More" ? $("#more" + id + "button").val("Less") : $("#more" + id + "button").val("More");
  });
  
  
});
