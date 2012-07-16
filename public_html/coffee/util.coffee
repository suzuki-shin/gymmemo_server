###
# アプリ固有じゃないユーティリティっぽいもの
###
_DEBUG = true
# _DEBUG = false

_l = (mes, log_func =(mes)-> console?.log mes) ->
  if _DEBUG
    log_func mes

_success_func = (tx) ->
  _l 'OK'
  _l tx
_failure_func = (tx) ->
  _l 'NG'
  _l tx

notify = (text) ->
  $('#notification').text(text).fadeToggle('slow', 'linear')
  sleep(3, -> $('#notification').fadeToggle('slow', 'linear'));

@sleep = (secs, cb) ->
  setTimeout cb, secs * 1000

getYYYYMMDD =->
  dt = new Date()
  yyyy = dt.getFullYear()
  mm = dt.getMonth() + 1
  mm = '0' + mm if mm < 10
  dd = dt.getDate()
  dd = '0' + dd if dd < 10
  return yyyy + '/' + mm + '/' + dd

_post = (url, data, success = _success_func, failure = _failure_func) ->
  _l '_post ' + url
  _l success
  $.ajax
    url: url
    type: 'POST'
    data: data
    success: success
    error: failure

_get = (url, success = _success_func, failure = _failure_func) ->
  _l '_get ' + url
  $.ajax
    url: url
    type: 'GET'
    dataType: 'json'
    success: success
    error: failure
