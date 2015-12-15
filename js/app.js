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
  L.mapbox.map('map', 'mapbox.streets').setView([38.8929,-77.0252], 14);

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
