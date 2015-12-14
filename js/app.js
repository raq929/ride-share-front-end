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
      var credentials = rsHelpers.wrap('credentials', shsHelpers.form2object(this));
      console.log(credentials);
      var cb = function (error, data) {
        if (error){
          shsHelpers.errorHandler(error);
          return false;
        }
        $("#loginCheckbox").trigger('click');
        $("#loginCheckbox").hide();
        $('#message').text("You have logged in");
        $('#logout').show();
        
        var user = new User(data.user.id, data.user.token);
      };

      rsapi.login(credentials, cb);
      return false;
    });


});
