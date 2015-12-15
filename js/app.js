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
    return data;
  }
};


var user;
var rides;

var rides = $("ridesListHere");

var setLocationClickHandlers = function(locations, map){
    locations.eachLayer(function(locale) {
      // find the div with the same id as the layer
      var prop = locale.feature.properties;
      console.log(prop)
      id = prop.id;
      console.log(id)
      rideDiv = $("#ride" + id);

      rideDiv.on('click',function() {
      // 1. Toggle an active class for `listing`. View the source in the demo link for example.

      // 2. When a menu item is clicked, animate the map to center
      // its associated locale and open its popup.
      map.setView(locale.getLatLng(), 12);
      locale.openPopup();
      });

      locale.on('click', function(e) {
      // 1. center the map on the selected marker.
      map.panTo(locale.getLatLng());

      // 2. Set active the markers associated listing.
      // setActive(listing);
    });
  });
}; 




$(document).ready(function(){

  ridesListTemplate = Handlebars.compile($("#ridesList").html());
  Handlebars.registerHelper('isOwner', function(ride){
    if (this.owner.id = user.id){
      return true;
    }
    else return false;
  });


  
  // sets up mapBox 
  L.mapbox.accessToken = 'pk.eyJ1IjoicmFxOTI5IiwiYSI6ImNpaTYxZm9mMjAxa3R0eGtxY25reW12cXAifQ.g49YwXKsFMU2bcQDQdfaDw';
  var map = L.mapbox.map('map', 'mapbox.streets')
  map.setView([42.3601,-71.0589], 7);

  //makes initial call to /rides
  var ridesCallback = function (error, data) {
    if (error){
      console.log(error);
    } else {
      rides = new Rides(data.rides);
      //get destinations for map
      destinations = rides.getDestinations();
      //calculate seats available and if owner is current user
      // attach those values to ride
      rides.seatsLeft();
      rides.isOwner();
      //compile handlebars template
      var newHTML = ridesListTemplate(rides);
      $("#ridesListHere").html(newHTML);
      //get GeoJson and put markers on the map
      rides.getDestinationGeoJSON();
      var locations = L.mapbox.featureLayer().addTo(map);
      locations.setGeoJSON(geoJSON);
      setLocationClickHandlers(locations, map);
      $('ride2').on('click', function(){
        alert("You clicked!");
      });
    }
  };

  rsapi.getRides(ridesCallback);


  $('#loginForm').on('submit', function(e){
      e.preventDefault();
      var credentials = rsHelpers.wrap('credentials', rsHelpers.form2object(this));
      console.log(credentials);
      var cb = function (error, data) {
        if (error){
          console.log(error);
        }
        //hide login form and label
        $("#loginCheckbox").trigger('click');
        $("#loginLabel").css({display: 'none'});
        $('#message').text("You have logged in");
        // display logout 
        $('#logout').css({display: 'inline'});
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
