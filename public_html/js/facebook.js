(function() {
  var APP_ID, fb_feed_post, _fb_feed_post;

  APP_ID = '389000681145540';

  _fb_feed_post = function(message) {
    alert(message);
    return FB.api('/me/feed', 'post', {
      message: message
    }, function(response) {
      if ((!response) || response.error) {
        return alert('Error occured');
      } else {
        return alert('Post ID: ' + response.id);
      }
    });
  };

  fb_feed_post = function() {
    var body;
    body = $('#socialpost').attr('value');
    alert(body);
    return _fb_feed_post(body);
  };

  FB.init({
    appId: APP_ID,
    cookie: true,
    status: true,
    xfbml: true
  });

  FB.getLoginStatus(function(response) {
    alert('getLoginStatus');
    if (response.session) {
      return alert('logged in and connected user, someone you know');
    } else {
      alert('no user session available, someone you dont know');
      return FB.login(function(response) {
        if (response.authResponse) {
          return alert('Welcome!  Fetching your information.... ');
        } else {
          return alert('User cancelled login or did not fully authorize.');
        }
      });
    }
  });

}).call(this);
