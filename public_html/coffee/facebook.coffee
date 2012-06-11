APP_ID = '389000681145540'

_fb_feed_post = (message) ->
  alert message
  FB.api '/me/feed', 'post', { message: message }, (response) ->
    if (not response) or response.error
      alert('Error occured');
    else
      alert('Post ID: ' + response.id);

fb_feed_post =->
  body = $('#socialpost').attr('value')
  alert body
  _fb_feed_post body

FB.init({ appId:APP_ID, cookie:true, status:true, xfbml:true });
FB.getLoginStatus (response) ->
  alert('getLoginStatus');
  if response.session
    alert('logged in and connected user, someone you know')
  else
    alert('no user session available, someone you dont know')

    _login = (response) ->
      if response.authResponse
        alert('Welcome!  Fetching your information.... ')
      else
        alert('User cancelled login or did not fully authorize.')

    FB.login _login

