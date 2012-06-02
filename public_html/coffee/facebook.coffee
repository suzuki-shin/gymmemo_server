APP_ID = '389000681145540'

fb_feed_post = (message) ->
  FB.api '/me/feed', 'post', { message: message }, (response) ->
    if not response or response.error
      alert('Error occured');
    else
      alert('Post ID: ' + response.id);


FB.init({ appId:APP_ID, cookie:true, status:true, xfbml:true });

FB.getLoginStatus (response) ->
  if response.session
    console?.log('logged in and connected user, someone you know')
    fb_feed_post 'yarr'
  else
    console.log('no user session available, someone you dont know')
    FB.login (response) ->
      if response.authResponse
        console?.log('Welcome!  Fetching your information.... ')
        fb_feed_post 'more beer!'
      else
        console.log('User cancelled login or did not fully authorize.')
