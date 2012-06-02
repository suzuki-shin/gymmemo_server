(function() {
  var APP_ID, fb_feed_post;

  APP_ID = '389000681145540';

  fb_feed_post = function(message) {
    return FB.api('/me/feed', 'post', {
      message: message
    }, function(response) {
      if (!response || response.error) {
        return alert('Error occured');
      } else {
        return alert('Post ID: ' + response.id);
      }
    });
  };

  FB.init({
    appId: APP_ID,
    cookie: true,
    status: true,
    xfbml: true
  });

  FB.getLoginStatus(function(response) {
    if (response.session) {
      if (typeof console !== "undefined" && console !== null) {
        console.log('logged in and connected user, someone you know');
      }
      return fb_feed_post('yarr');
    } else {
      console.log('no user session available, someone you dont know');
      return FB.login(function(response) {
        if (response.authResponse) {
          if (typeof console !== "undefined" && console !== null) {
            console.log('Welcome!  Fetching your information.... ');
          }
          return fb_feed_post('more beer!');
        } else {
          return console.log('User cancelled login or did not fully authorize.');
        }
      });
    }
  });

}).call(this);
