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







$(document).ready(function(){

  $('#loginForm').on('submit', function(e){
      e.preventDefault();
      var credentials = rsHelpers.wrap('credentials', rsHelpers.form2object(this));
      console.log(credentials);
      var cb = function (error, data) {
        if (error){
          console.log(error);
        }
        $("#loginCheckbox").trigger('click');
        $('#message').text("You have logged in");
        $('#logout').css({display: 'inline'});
        $("#loginLabel").css({display: 'none'});
        
        var user = new User(data.user.id, data.user.token);
      };

      rsapi.login(credentials, cb);
      return false;
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
     
  });

});
