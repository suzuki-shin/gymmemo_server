###
# config
###
_DEBUG = true
# DEBUG = false
SERVER_BASE_URL ='http://gymmemoserver.appspot.com/'
SERVER_BASE_URL ='http://localhost:8080/'

db = window.openDatabase "gymmemo","","GYMMEMO", 1048576
order = [' ASC ', ' DESC ']


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

# obj = {'id' : 1, 'name':'hoge', 'user':'xxx@mail.com', 'attr':'minutes', 'ordernum':1}
# のようなデータを受け取り
# [('id', 'name', 'user', 'attr', 'ordernum'), (1,'hoge','xxx@mail.com','minutes',1)]
# のようなデータにして返す
_obj2keysAndVals = (obj) ->
  _l obj
  keys = []
  vals = []
  for k,v of obj
    keys.push(k)
    vals.push(v)
  [keys, vals]

# obj = {'id' : 1, 'name':'hoge', 'user':'xxx@mail.com', 'attr':'minutes', 'ordernum':1}
# のようなデータを受け取り
# ['(id, name, user, attr, ordernum) values (?,?,?,?,?)', (1,'hoge','xxx@mail.com','minutes',1)]
# のようなデータにして返す
obj2insertSet = (obj) ->
  [keys, vals] = _obj2keysAndVals(obj)
  ['(' + keys.join(',') + ') values (' + ('?' for v in vals).join(',') + ')', vals]

# obj = {'id' : 1, 'name':'hoge', 'user':'xxx@mail.com', 'attr':'minutes', 'ordernum':1}
# のようなデータを受け取り
# ['set id = ?, name = ?, user = ?, attr = ?, ordernum = ?', (1,'hoge','xxx@mail.com','minutes',1)]
# のようなデータにして返す
obj2updateSet = (obj) ->
  [keys, vals] = _obj2keysAndVals(obj)
  [' set ' + (k + ' = ?' for k in keys).join(','), vals]

createTableItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'createTableItems'
  tx.executeSql 'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, attr TEXT, is_saved INT DEFAULT 0 NOT NULL, ordernum INT DEFAULT 0, is_active INTEGER DEFAULT 1)', [],
                success_func,
                failure_func

createTableTrainings = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'createTableTrainings'
  tx.executeSql 'CREATE TABLE IF NOT EXISTS trainings (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL, value INTEGER NOT NULL, created_at TEXT, is_saved INT DEFAULT 0 NOT NULL)', [],
                success_func,
                failure_func

selectItemById = (tx, item_id, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectItemById'
  tx.executeSql 'select * from items where id = ?', [item_id],
                success_func,
                failure_func

selectItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectItems'
  tx.executeSql 'select * from items order by ordernum asc', [],
                success_func,
                failure_func

selectUnsavedItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectItems'
  tx.executeSql 'select * from items where is_saved = 0 order by ordernum asc', [],
                success_func,
                failure_func

selectUnsavedTrainings = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectTrainings'
  tx.executeSql 'select * from trainings where is_saved = 0 order by id asc', [],
                success_func,
                failure_func

selectTrainingsByDate = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectTrainingsByDate'
  SELECT_TRAININGS_BY_DATE = 'SELECT tr.item_id AS item_id, it.name AS name, tr.value AS value, it.attr AS attr, tr.created_at AS created_at FROM trainings AS tr LEFT JOIN items AS it ON tr.item_id = it.id WHERE tr.created_at = ? ORDER BY tr.id '# + order[config['todays_training_order']]
  tx.executeSql SELECT_TRAININGS_BY_DATE, [getYYYYMMDD()],
                success_func,
                failure_func

insertItem = (tx, obj, success_func = _success_func, failure_func = _failure_func) ->
  insertData tx, 'items', obj, success_func, failure_func

updateItem = (tx, obj, where_state, success_func = _success_func, failure_func = _failure_func) ->
  updateData tx, 'items', obj, where_state, success_func, failure_func

insertTraining = (tx, obj, success_func = _success_func, failure_func = _failure_func) ->
  insertData tx, 'trainings', obj, success_func, failure_func

updateTraining = (tx, obj, where_state, success_func = _success_func, failure_func = _failure_func) ->
  updateData tx, 'trainings', obj, where_state, success_func, failure_func

insertData = (tx, table, obj, success_func = _success_func, failure_func = _failure_func) ->
  _l 'insertData'
  [set, params] = obj2insertSet obj
  _l table
  _l set
  _l params
  tx.executeSql 'insert into ' + table + ' ' + set, params,
                success_func,
                failure_func

updateData = (tx, table, obj, where_state, success_func = _success_func, failure_func = _failure_func) ->
  _l 'updateData'
  [set, params] = obj2updateSet obj
  _update_state = 'update ' + table + ' ' + set + ' where ' + where_state
  _l where_state
  _l _update_state
#   params.push(where_state[1])
#   params.push(parseInt(where_state[1]))
  _l params
  tx.executeSql _update_state,
                params,
                success_func,
                failure_func


addItem = (ev) ->
  db.transaction (tx) ->
    itemname = $('#itemname').attr('value')
    itemattr = $('#itemattr').attr('value')
    insertItem tx, {name: itemname or null, attr: itemattr},
               (tx) ->
                 renderItemForms tx
                 $('#itemname').attr('value', '')
                 $('#itemattr').attr('value', '')
                 notify itemname
  false

editItem = (ev) ->
  _l 'editItem'
  return if not confirm('本当に変更しても良いですか？')
#   _l ev.target.id
  item_id = ev.target.id.slice(17)
#   _l item_id
  _l $('#itemsetting' + item_id).attr('value')
  _l $('#itemattrsetting' + item_id).attr('value')

  db.transaction (tx) ->
    updateItem tx, {name: $('#itemsetting' + item_id).attr('value') or null, attr: $('#itemattrsetting' + item_id).attr('value')}, 'id = ' + item_id,
#     updateItem tx, {name: $('#itemsetting' + item_id).attr('value') or null, attr: $('#itemattrsetting' + item_id).attr('value')}, ['id = ?', item_id],
               renderItemForms


# 渡されたselect結果のresをfuncで加工してjqobjに追記する関数
# res: result object of tx.executeSql()
# jqobj: jquery object to append
# func: 1 args function for format res
_renderRes = (res, jqobj, func) ->
   jqobj.empty().append func(res)

renderItemForms = (tx) ->
  _l 'renderItemForms'
  _res2inputElems = (res) ->
    len = res.rows.length
    ('<td>' + res.rows.item(i).name + '</td><td><input class="input-small" type="number" id="item' + res.rows.item(i).id + '" size="3" />' + res.rows.item(i).attr + '</td>' for i in [0...len])

  _resToForm =  (res) -> wrapHtmlList(_res2inputElems(res), 'tr').join('')

  selectItems tx, (tx, res) -> _renderRes res, $('#itemlist'), _resToForm

renderItems = (tx) ->
  _l 'renderItems'
  _res2string = (res) ->
    len = res.rows.length
    item_forms = []
    for i in [0...len]
      id = res.rows.item(i).id
      item_forms.push('<input type="text" id="itemsetting' + id + '" value="' + res.rows.item(i).name + '"/><input style="width:20px" type="text" id="itemattrsetting' + res.rows.item(i).id + '" value="' + res.rows.item(i).attr + '"/><button class="itemsettingbutton" id="itemsettingbutton' + id + '">変更</button>')
#       button_id = 'itemsettingbutton' + id
#       _l '#' + button_id
#       $('#' + button_id).on('click', -> alert 'ddd7')
    item_forms
  _res2li = (res) -> wrapHtmlList(_res2string(res), 'li').join('')
  selectItems tx, (tx, res) -> _renderRes(res, $('#itemlistsetting'), _res2li)


renderTodaysTrainings = (tx) ->
  _l 'renderTodaysTrainings'
  selectTrainingsByDate tx, (tx, res) -> $('#todaystraininglist').empty().append wrapHtmlList(wrapHtmlList(_res2NameValues(res), 'td'), 'tr').join('')

renderTrainingByDate = (ev) ->
    _l 'renderTrainingByDate'
    date = ev.target.textContent
    _renderTrainingByDate = (tx) ->
        console.log('_renderTrainingByDate')
        config = getConfig()
        SELECT_TRAININGS_BY_DATE = 'SELECT * FROM trainings t LEFT JOIN items i ON t.item_id = i.id WHERE t.created_at = ? ORDER BY t.id '# + order[config['todays_training_order']]
        tx.executeSql SELECT_TRAININGS_BY_DATE, [date],
                      (tx, res) ->
                          $('#trainingsubtitle').text date
                          $('#pasttraininglist').empty().append wrapHtmlList(wrapHtmlList(_res2NameValues(res), 'td'), 'tr').join('')
                      _failure_func
    db.transaction _renderTrainingByDate, _failure_func


renderPastTrainingsDate = (tx) ->
#     db.transaction _renderPastTrainingsDate, _failure_func

# _renderPastTrainingsDate = (tx) ->
    _l('_renderPastTrainingsDate')
    config = getConfig()
    _l config
    SELECT_TRAININGS_DATE = 'SELECT created_at FROM trainings t LEFT JOIN items i ON t.item_id = i.id GROUP BY t.created_at ORDER BY t.created_at ' + order[config['past_trainings_order']] + ' LIMIT 10'
    tx.executeSql SELECT_TRAININGS_DATE, [],
                  (tx, res) ->
                      $('#trainingsubtitle').text ''
                      $('#pasttraininglist').empty()
                                          .append wrapHtmlList(wrapHtmlList(_res2Date(res), 'td'), 'tr').join('')
                  _failure_func


_res2NameValues = (res) ->
    len = res.rows.length
    ('<td>' + res.rows.item(i).name + '</td><td>' + res.rows.item(i).value + ' ' + res.rows.item(i).attr + '</td>'for i in [0...len])

_res2ItemAll = (res) ->
    len = res.rows.length
    (res.rows.item(i).id + ' ' + res.rows.item(i).name + ' ' + res.rows.item(i).user + ' ' + res.rows.item(i).attr + ' ' + res.rows.item(i).is_saved for i in [0...len])

_res2ItemAllList = (res) ->
    len = res.rows.length
    ({id:res.rows.item(i).id, name:res.rows.item(i).name, user:res.rows.item(i).user, attr:res.rows.item(i).attr, is_saved:res.rows.item(i).is_saved, is_active:res.rows.item(i).is_active, ordernum:res.rows.item(i).ordernum} for i in [0...len])

_res2TrainingAll = (res) ->
    len = res.rows.length
    (res.rows.item(i).id + ' ' + res.rows.item(i).item_id + ' ' + res.rows.item(i).value + ' ' + res.rows.item(i).created_at + ' ' + res.rows.item(i).is_saved for i in [0...len])

_res2TrainingAllList = (res) ->
    len = res.rows.length
    ({id:res.rows.item(i).id, item_id:res.rows.item(i).item_id,  value:res.rows.item(i).value, is_saved:res.rows.item(i).is_saved, is_active:res.rows.item(i).is_active} for i in [0...len])

_res2Date = (res) ->
    len = res.rows.length
    ('<span>' + res.rows.item(i).created_at + '</span>' for i in [0...len])


wrapHtmlList = (list, tag) ->
    ('<' + tag + '>' + l + '</' + tag + '>' for l in list)


addTraining = (ev) ->
  _l 'addTraining'
  return if not ev.target.value

  item_id = ev.target.id.slice(4,8)
  value = ev.target.value
  db.transaction (tx) ->
    insertTraining tx, {item_id: item_id, value: value, created_at: getYYYYMMDD()},
                   (tx, res) ->
                     renderTodaysTrainings tx
                     $(ev.target).attr('value', '')
                     selectItemById tx,
                                    item_id,
                                    (tx, res) -> notify res.rows.item(0).name + ' ' + value + res.rows.item(0).attr
  false

getYYYYMMDD =->
  dt = new Date()
  yyyy = dt.getFullYear()
  mm = dt.getMonth() + 1
  mm = '0' + mm if mm < 10
  dd = dt.getDate()
  dd = '0' + dd if dd.length < 10
  return yyyy + '/' + mm + '/' + dd


getUser =->
  _l 'getUser'
  $.ajax
    url: SERVER_BASE_URL + 'user_info'
    type: 'GET'
    success: (data, status, xhr) ->
      _l 'success'
      _l data
      _l status
    error: (data, status, xhr) ->
      _l 'error'
      _l data
      _l status

setUp =->
  _l 'setUp'
#   getUser()
  db.transaction (tx) ->
    createTableItems tx
    createTableTrainings tx
    renderItemForms tx
    renderTodaysTrainings tx
    renderPastTrainingsDate tx
    renderItems tx
#     $('#setting').hide()
  createConfig()


getConfig =->
  _l 'getConfig'
  JSON.parse(localStorage['config'])

setConfig = (change_config) ->
  config = getConfig()
  _setConfig($.extend(config, change_config))

_setConfig = (json) ->
  _l '_setConfig'
  localStorage['config'] = JSON.stringify(json)

createConfig =->
  _l 'createConfig'
  return if localStorage['config']?
  _setConfig(
    db_version: 0
    localstrage_version: 0
    todays_trainings_order: 1
    past_trainings_order: 1
  )

##
## for test
##
xxx = (res, func = (x) -> x) ->
  _l 'xxx'
  len = res.rows.length
  for i in [0...len]
    _l func(res.rows.item(i))

debugSelectItems =->
  _l 'debugSelectItems'
  db.transaction (tx) ->
    tx.executeSql 'select * from items', [],
                  (tx, res) ->
                    $('#showdb').append wrapHtmlList(_res2ItemAll(res), 'li').join('')

debugSelectTrainings =->
  _l 'debugSelectTrainings'
  db.transaction (tx) ->
    tx.executeSql 'select * from trainings', [],
                  (tx, res) ->
                    $('#showdb').append wrapHtmlList(_res2TrainingAll(res), 'li').join('')

dropTableItems =->
  if not confirm 'itemsテーブルをdropして良いですか？'
    return

  db.transaction (tx) ->
    tx.executeSql 'DROP TABLE items', [],
                  -> alert 'error: dropTableItems',
                  -> alert 'success: dropTableItems',

dropTableTrainings =->
  if not confirm 'trainingsテーブルをdropして良いですか？'
    return
  alert 'iii'
  db.transaction (tx) ->
    tx.executeSql 'DROP TABLE trainings', [],
                  -> alert 'error: dropTableTrainings',
                  -> alert 'success: dropTableTrainings',

_post = (url, data, success = _success_func, failure = _failure_func) ->
  _l '_post ' + url
  $.ajax
    url: url
    type: 'POST'
    data: data
    success: (data, status, xhr) -> success
    error: (data, status, xhr) -> failure

_get = (url, success = _success_func, failure = _failure_func) ->
  _l '_get ' + url
  $.ajax
    url: url
    type: 'GET'
    dataType: 'json'
    success: success
    error: failure

saveItems = (tx) ->
  _l 'saveItems'
  selectUnsavedItems tx,
                     (tx, res) ->
                       data = _res2ItemAllList(res)
                       _l JSON.stringify(data)
                       _post SERVER_BASE_URL + 'save_item',
                             JSON.stringify(data),
                             notify "Items saved."#_l (d['id'] for d in data).join(',')
                             updateItem tx, {is_saved:1}, 'id IN (' + (d['id'] for d in data).join(',') + ')'

saveTrainings = (tx) ->
  _l 'saveTrainings'
  selectUnsavedTrainings tx,
                     (tx, res) ->
                       data = _res2TrainingAllList(res)
                       _l JSON.stringify(data)
                       _post SERVER_BASE_URL + 'save_training',
                             JSON.stringify(data),
                             notify "Trainings saved."#_l (d['id'] for d in data).join(',')
                             updateTraining tx, {is_saved:1}, 'id IN (' + (d['id'] for d in data).join(',') + ')'

downloadItems = (tx, success = _success_func, failure = _failure_func) ->
  _l 'downloadItems'
  _get SERVER_BASE_URL + 'dl_items',
       (data, status, xhr) -> success data,
       (data, status, xhr) -> failure status



$ ->
  setUp()

  $('#itemstitle').on 'click touch', -> $('#itemadd').toggle()
  $('#itemadd button').on 'click touch', addItem
  $(document).on 'blur', '#itemlist input', addTraining
  $(document).on 'click touch', '.itemsettingbutton', editItem
#   $('.itemsettingbutton').on 'click', -> alert 'jkjkj'

  $('#pasttrainingstitle').on 'click touch', ->
    db.transaction (tx) -> renderPastTrainingsDate tx

  $(document).on 'touchstart', '#pasttraininglist span', renderTrainingByDate
  $(document).on 'click', '#pasttraininglist span', renderTrainingByDate
#   $(document).on 'touchstart click', '#settingtitle', -> $('#setting').toggle()

  $('#save').on 'click touch', ->
    db.transaction (tx) ->
      saveItems(tx)
      saveTrainings(tx)


  $('#myTab a').on 'click touch', ->
    e.preventDefault();
    $(this).tab('show');


  $('#debug').on 'click touch',
                 ->
                   $('#showdb').toggle()
                   $('#clear').toggle()
                   $('#test1').toggle()
                   $('#test2').toggle()
                   $('#test3').toggle()

  $('#showdb').click ->
    debugSelectItems()
    debugSelectTrainings()
  $('#clear').click ->
    dropTableItems()
    dropTableTrainings()

  $('#test1').on 'click touch', ->
    _l 'test1'
    db.transaction (tx) ->
      tx.executeSql 'select * from items left join trainings on items.id = trainings.item_id', [],
                    (tx, res) -> xxx(res, (x) -> x.attr + ':' + x.created_at + ':' + x.item_id + ':' + x.name)
#       renderTodaysTrainings tx
#       renderItemForms tx
#       createTableItems tx,
#                        -> _l('suxx'),
#                        -> _l('faixx')

  $('#test2').on 'click touch', ->
    _l 'test2!'
#     getUser()
    db.transaction (tx) ->
#       saveItems(tx)
#       saveTrainings(tx)
      downloadItems(tx)
#       selectItems tx,
#                   (tx, res) -> _l JSON.stringify(res)
#     db.transaction (tx) ->
#       selectTrainingsByDate tx,
#                             (tx, res) -> xxx(res, (x) -> x.attr + ':' + x.created_at + ':' + x.item_id + ':' + x.name)
#     _l getYYYYMMDD()
#     _l wrapHtmlList [1..5], 'li'
#     db.transaction (tx) ->
#       selectItems tx,
#                   (tx, res) -> xxx res
#                   (tx, res) -> _l 'faixx'

  $('#test3').on 'click touch', ->
    notify('hoge!')
#     renderPastTrainingsDate
#                  -> setConfig({db_version:10})
#                    _l _obj2keysAndVals {id:1, name:'hoge', age:30}
#                    _l obj2insertSet {id:1, name:'hoge', age:30}
#                    db.transaction (tx) ->
#                      insertItem tx, {id:3, name:'abxkdjsk', user:'suzuki@', attr:'', ordernum:5}
