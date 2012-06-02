(function() {

  /*
  # アプリ固有じゃないユーティリティっぽいもの
  */

  var getYYYYMMDD, notify, _DEBUG, _failure_func, _get, _l, _post, _success_func;

  _DEBUG = true;

  _l = function(mes, log_func) {
    if (log_func == null) {
      log_func = function(mes) {
        return typeof console !== "undefined" && console !== null ? console.log(mes) : void 0;
      };
    }
    if (_DEBUG) return log_func(mes);
  };

  _success_func = function(tx) {
    _l('OK');
    return _l(tx);
  };

  _failure_func = function(tx) {
    _l('NG');
    return _l(tx);
  };

  notify = function(text) {
    $('#notification').text(text).fadeToggle('slow', 'linear');
    return sleep(3, function() {
      return $('#notification').fadeToggle('slow', 'linear');
    });
  };

  this.sleep = function(secs, cb) {
    return setTimeout(cb, secs * 1000);
  };

  getYYYYMMDD = function() {
    var dd, dt, mm, yyyy;
    dt = new Date();
    yyyy = dt.getFullYear();
    mm = dt.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    dd = dt.getDate();
    if (dd < 10) dd = '0' + dd;
    return yyyy + '/' + mm + '/' + dd;
  };

  _post = function(url, data, success, failure) {
    if (success == null) success = _success_func;
    if (failure == null) failure = _failure_func;
    _l('_post ' + url);
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      success: function(data, status, xhr) {
        return success;
      },
      error: function(data, status, xhr) {
        return failure;
      }
    });
  };

  _get = function(url, success, failure) {
    if (success == null) success = _success_func;
    if (failure == null) failure = _failure_func;
    _l('_get ' + url);
    return $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: success,
      error: failure
    });
  };

}).call(this);
