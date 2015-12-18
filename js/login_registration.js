$(document).ready(function(){

// hide registration form when login is clicked
  // and vice versa
  $("#loginLabel").on('click', function(){
    if ($("#registrationCheckbox").prop('checked') && 
      !$("#loginCheckbox").prop( "checked" )){
     $("#registrationCheckbox").prop('checked', false);
    }
  });

   $("#registrationLabel").on('click', function(){
    if (!$("#registrationCheckbox").prop('checked') && 
      $("#loginCheckbox").prop( "checked" )){
     $("#loginCheckbox").prop('checked', false);
    }
  });
 
  // login form click handler
  $('#loginForm').on('submit', function(e){
      e.preventDefault();
      var credentials = rsHelpers.wrap('credentials', rsHelpers.form2object(this));
      var cb = function (error, data) {
        if (error){
          console.log(error);
        } else {
          //hide login form and label
          $("#loginCheckbox").trigger('click');
          $("#loginLabel").css({display: 'none'});
      
          // display logout and new ride button
          $('#logout').css({display: 'inline-block'});
          $('#newRideButton').show();
          //get rides
          rsapi.getRides(ridesCallback);
          
          user = new User(data.user.id, data.user.token);
        }
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
      });
    });  
     
   $('#logout').click(function(){
      var cb = function(error, data){
        if (error) {
          $('#message').val('status: ' + error.status + ', error: ' +error.error);
  
        }  else {
          user = null;
        $('#logout').css({display: 'none'});
        $("#loginLabel").css({display: 'inline-block'});
        // hide open forms
        $("#cancelNewRide").click();
        $("#cancelEditRide").click();

        // hide new ride button
        $("#newRideButton").hide();
        rsHelpers.clearForms();
        rsapi.getRides(ridesCallback);
        }
      };
      rsapi.logout(cb);
  });
});
