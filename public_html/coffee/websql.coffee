###
# config
###
SERVER_BASE_URL ='http://gym-memo.appspot.com/'
# SERVER_BASE_URL ='http://4.gym-memo.appspot.com/'
# SERVER_BASE_URL ='http://localhost:8080/'

db = window.openDatabase "gymmemo","","GYMMEMO", 1048576
DB_VERSION = 1
order = [' ASC ', ' DESC ']


# obj = {'id' : 1, 'name':'hoge', 'user':'xxx@mail.com', 'attr':'minutes', 'ordernum':1}
# のようなデータを受け取り
# [('id', 'name', 'user', 'attr', 'ordernum'), (1,'hoge','xxx@mail.com','minutes',1)]
# のようなデータにして返す
_obj2keysAndVals = (obj) ->
#   _l obj
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


# 同じ型のobj(JSON)を受け取りそれをhtmlのテーブル文字列(tr,td)にして返す
objlist2table = (objlist) ->
  headers = _obj2keysAndVals(objlist[0])[0]
  data = (_obj2keysAndVals(o)[1] for o in objlist)
#   _l headers
#   _l data
  table_str = '<tr>' + ('<th>' + h + '</th>' for h in headers).join('') + '</tr>'
  for l in data
    table_str += '<tr>' + ('<td>' + d + '</td>' for d in l).join('') + '</tr>'
  _l table_str
  table_str

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

selectActiveItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectActiveItems'
  tx.executeSql 'SELECT * FROM items WHERE is_active = 1 ORDER BY ordernum ASC', [],
                success_func,
                failure_func

selectAllItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectAllItems'
  tx.executeSql 'SELECT * FROM items ORDER BY ordernum ASC', [],
                success_func,
                failure_func

selectUnsavedItems = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectUnsavedItems'
  tx.executeSql 'select * from items where is_saved = 0 order by ordernum asc', [],
                success_func,
                failure_func

selectUnsavedTrainings = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectUnsavedTrainings'
  tx.executeSql 'SELECT * FROM trainings WHERE is_active = 1 AND is_saved = 0 ORDER BY id ASC', [],
                success_func,
                failure_func

selectAllTrainings = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectAllTrainings'
  tx.executeSql 'SELECT * FROM trainings ORDER BY id ASC', [],
                success_func,
                failure_func

selectTrainingsByDate = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectTrainingsByDate'
  SELECT_TRAININGS_BY_DATE = 'SELECT tr.id AS id, tr.item_id AS item_id, it.name AS name, tr.value AS value, it.attr AS attr, tr.created_at AS created_at FROM trainings AS tr LEFT JOIN items AS it ON tr.item_id = it.id WHERE tr.is_active = 1 AND tr.created_at = ? ORDER BY tr.id '# + order[config['todays_training_order']]
  tx.executeSql SELECT_TRAININGS_BY_DATE, [getYYYYMMDD()],
                success_func,
                failure_func

selectTrainingsGroupedItemByDate = (tx, success_func = _success_func, failure_func = _failure_func) ->
  _l 'selectTrainingsGroupedItemByDate'
  SELECT_TRAININGS_BY_DATE = 'SELECT tr.item_id AS item_id,
                                     max(it.name) AS name,
                                     sum(tr.value) AS value,
                                     max(it.attr) AS attr,
                                     max(tr.created_at) AS created_at
                                FROM trainings AS tr
                           LEFT JOIN items AS it
                                  ON tr.item_id = it.id
                               WHERE tr.is_active = 1 AND tr.created_at = ?
                            GROUP BY tr.item_id
                            ORDER BY tr.id '
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
  _l params
  tx.executeSql _update_state,
                params,
                success_func,
                failure_func

deleteData = (tx, table, where_state, success = _success_func, failure = _failure_func) ->
  _l 'deleteData'
  sql = 'UPDATE ' + table + ' SET is_active = 0 WHERE ' + where_state
  _l sql
  tx.executeSql sql, [], success, failure

deleteTraining = (ev) ->
  _l 'deleteTraining'
  if not confirm('削除しますか？')
    notify '削除をキャンセルしました'
    return

  id = ev.target.id.match(/(\d+)/).shift()
  db.transaction (tx) ->
    deleteData tx, 'trainings', 'id = ' + id,
               (tx, res) ->
                  notify '削除しました'
                  renderTodaysTrainings tx

addItem = (ev) ->
  db.transaction (tx) ->
    itemname = $('#itemname').attr('value')
    itemattr = $('#itemattr').attr('value')
    insertItem tx, {name: itemname or null, attr: itemattr},
               (tx) ->
                 renderItemForms tx
                 renderItems tx
                 $('#itemname').attr('value', '')
                 $('#itemattr').attr('value', '')
                 notify itemname
#                  saveItems(tx)
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
    updateItem tx, {name: $('#itemsetting' + item_id).attr('value') or null, attr: $('#itemattrsetting' + item_id).attr('value'), is_active: $('#itemactivesetting' + item_id).attr('value')}, 'id = ' + item_id,
               (tx) ->
                 renderItemForms(tx)
                 renderItems(tx)


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
    ('<td>' + res.rows.item(i).name + '</td><td><input class="input-small" type="number" id="item' + res.rows.item(i).id + '" />' + res.rows.item(i).attr + '</td>' for i in [0...len])

  _resToForm =  (res) -> wrapHtmlList(_res2inputElems(res), 'tr').join('')

  selectActiveItems tx, (tx, res) -> _renderRes(res, $('#itemlist'), _resToForm)

renderItems = (tx) ->
  _l 'renderItems'
  _res2string = (res) ->
    len = res.rows.length
    item_forms = []
    for i in [0...len]
      id = res.rows.item(i).id
      is_active = res.rows.item(i).is_active
      [classonbtn, classoffbtn] = if is_active is 1 then [' active ', ''] else ['', ' active ']
      item_forms.push('<tr class="row">
                         <td>
                           <input type="text" id="itemsetting' + id + '" value="' + res.rows.item(i).name + '"/>
                           <input type="text" id="itemattrsetting' + id + '" value="' + res.rows.item(i).attr + '"/>
                           <div class="btn-group" data-toggle="buttons-radio">
                             <button id="itemactivesettingbtnon' + id + '" class="btn itemactivesettingbtnon' + classonbtn + '">On</button>
                             <button id="itemactivesettingbtnoff' + id + '" class="btn itemactivesettingbtnoff' + classoffbtn + '">Off</button>
                           </div>
                           <input type="hidden" id="itemactivesetting' + id + '" value="' + is_active + '"/>
                           <button class="itemsettingbutton btn" id="itemsettingbutton' + id + '">変更</button>
                         </td>
                       </tr>')
#       if res.rows.item(i).is_active
#         $('#itemactivesettingbtnon'+ id).button()
#       else
#         $('#itemactivesettingbtnoff'+ id).button()
#       item_forms.push('<tr class="row"><td class="span6"><input type="text" id="itemsetting' + id + '" value="' + res.rows.item(i).name + '"/></td><td class="span2"><input type="text" id="itemattrsetting' + res.rows.item(i).id + '" value="' + res.rows.item(i).attr + '"/></td><td class="span2"><input type="text" id="itemactivesetting' + res.rows.item(i).is_active + '" value="' + res.rows.item(i).is_active + '"/></td><td class="span2"><button class="itemsettingbutton btn" id="itemsettingbutton' + id + '">変更</button></td></tr>')
    item_forms
  _res2li = (res) -> _res2string(res).join('')
  selectAllItems tx, (tx, res) -> _renderRes(res, $('#itemlistsetting'), _res2li)


renderTodaysTrainings = (tx) ->
  _l 'renderTodaysTrainings'
  config = getConfig()
  _selectTrainings = if config['select_trainings_type'] is 1 then selectTrainingsByDate else selectTrainingsGroupedItemByDate
  _selectTrainings tx, (tx, res) -> $('#todaystraininglist').empty().append _res2NameValues(res, 'todaystraining').join('')

renderTrainingByDate = (ev) ->
    _l 'renderTrainingByDate'
    date = ev.target.textContent
    _renderTrainingByDate = (tx) ->
        console.log('_renderTrainingByDate')
        config = getConfig()
        SELECT_TRAININGS_BY_DATE = 'SELECT *
                                      FROM trainings t
                                 LEFT JOIN items i
                                        ON t.item_id = i.id
                                     WHERE t.is_active = 1 AND t.created_at = ?
                                     ORDER BY t.id '
        SELECT_TRAININGS_GROUPED_ITEM__BY_DATE = 'SELECT max(t.id) AS id,
                                                         t.item_id,
                                                         i.name,
                                                         sum(t.value) AS value,
                                                         max(i.attr) AS attr,
                                                         max(t.created_at) AS created_at
                                                    FROM trainings t
                                               LEFT JOIN items i
                                                      ON t.item_id = i.id
                                                   WHERE t.is_active = 1 AND t.created_at = ?
                                                GROUP BY t.item_id
                                                ORDER BY t.id '
        config = getConfig()
        _select_tranings = if config['select_trainings_type'] is 1 then SELECT_TRAININGS_BY_DATE else SELECT_TRAININGS_GROUPED_ITEM__BY_DATE
        _l _select_tranings
        tx.executeSql _select_tranings, [date],
                      (tx, res) ->
                          $('#trainingsubtitle').text date
                          $('#pasttraininglist').empty().append _res2NameValues(res, 'pasttraining').join('')
                      _failure_func
    db.transaction _renderTrainingByDate, _failure_func


renderPastTrainingsDate = (tx) ->
  _l '_renderPastTrainingsDate'
  config = getConfig()
  _l config
  SELECT_TRAININGS_DATE = 'SELECT created_at FROM trainings t LEFT JOIN items i ON t.item_id = i.id WHERE t.is_active = 1 GROUP BY t.created_at ORDER BY t.created_at ' + order[config['past_trainings_order']] + ' LIMIT 10'
  _render = (tx, res) ->
    $('#trainingsubtitle').text ''
    $('#pasttraininglist').empty()
                          .append wrapHtmlList(_res2Date(res), 'tr').join('')
  tx.executeSql SELECT_TRAININGS_DATE, [], _render, _failure_func


_res2NameValues = (res, pre_id) ->
    len = res.rows.length
    ('<tr><td id="'+ pre_id + res.rows.item(i).id + '">' + res.rows.item(i).name + '</td><td>' + res.rows.item(i).value + ' ' + res.rows.item(i).attr + '</td></tr>'for i in [0...len])

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
    ({id:res.rows.item(i).id, item_id:res.rows.item(i).item_id,  value:res.rows.item(i).value, is_saved:res.rows.item(i).is_saved, is_active:res.rows.item(i).is_active, created_at:res.rows.item(i).created_at} for i in [0...len])

_res2Date = (res) ->
    len = res.rows.length
    ('<td><span>' + res.rows.item(i).created_at + '</span><td>' for i in [0...len])


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
                                    (tx, res) ->
                                      notify res.rows.item(0).name + ' ' + value + res.rows.item(0).attr
#                                       saveTrainings(tx)

  false

getYYYYMMDD =->
  dt = new Date()
  yyyy = dt.getFullYear()
  mm = dt.getMonth() + 1
  mm = '0' + mm if mm < 10
  dd = dt.getDate()
  dd = '0' + dd if dd < 10
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
#   _l 'setUp'
#   _l '2012-05-09 23:38'
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
  db.transaction (tx) ->
    checkConfig tx


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
    select_trainings_type: 1
  )

checkConfig = (tx) ->
  _l 'checkConfig'
  config = getConfig()
  return if not config['db_version'] < DB_VERSION

  updateDb tx, config['db_version']

updateDb = (tx, config_db_version) ->
  _l 'updateDb'
  _updateDb_2_3 = (tx) ->
    _l '_updateDb_2_3'
    _l 'not yet'
  _updateDb_1_2 = (tx) ->
    _l '_updateDb_1_2'
    _l 'not yet'
  _updateDb_0_1 = (tx) ->
    _l '_updateDb_0_1'
    if config_db_version is 0
      tx.executeSql 'ALTER TABLE trainings ADD COLUMN is_active INT DEFAULT 1',
                    [],
                    (tx) ->
                      setConfig({db_version:1})
                      _updateDb_1_2(tx)
    else
      _updateDb_1_2(tx)

  _updateDb_0_1(tx)



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

debugShowConfig =->
  config = getConfig()
#   _l _obj2keysAndVals(config)
  _l objlist2table([config])
  $("#showdb").append objlist2table([config])

dropTableItems = (tx) ->
  return if not confirm 'itemsテーブルをdropして良いですか？'
  _dropTableItems(tx)

_dropTableItems = (tx) ->
  tx.executeSql 'DROP TABLE items', [],
                -> alert 'error: dropTableItems',
                -> alert 'success: dropTableItems',

dropTableTrainings = (tx) ->
  return if not confirm 'trainingsテーブルをdropして良いですか？'
  _dropTableTrainings(tx)

_dropTableTrainings = (tx) ->
  tx.executeSql 'DROP TABLE trainings', [],
                -> alert 'error: dropTableTrainings',
                -> alert 'success: dropTableTrainings',

_post_unsaved_items_and_update = (tx, items) ->
  $.ajax
    url: SERVER_BASE_URL + 'save_item'
    type: 'POST'
    data: JSON.stringify(items)
    complete: (xhr, status) ->
      if status is "success"
        _l "success"
        _where = 'id IN (' + (d['id'] for d in items).join(',') + ')'
        _l _where
        updateItem(tx, {is_saved:1}, _where)
      else
        _l "["+ status +"]Item save is failed!"

saveItems = (tx) ->
  _l 'saveItems'
  selectUnsavedItems tx,
                     (tx, res) ->
                       return if not res.rows.length
                       data = _res2ItemAllList(res)
                       _l JSON.stringify(data)
                       _post SERVER_BASE_URL + 'save_item',
                             JSON.stringify(data),
                             notify "Items saved."#_l (d['id'] for d in data).join(',')
                             updateItem tx, {is_saved:1}, 'id IN (' + (d['id'] for d in data).join(',') + ')'

saveAllItems = (tx) ->
  _l 'saveAllItems'
  selectAllItems tx,
                 (tx, res) ->
                   return if not res.rows.length
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
                       return if not res.rows.length
                       data = _res2TrainingAllList(res)
                       _l JSON.stringify(data)
                       _post SERVER_BASE_URL + 'save_training',
                             JSON.stringify(data),
                             notify "Trainings saved."#_l (d['id'] for d in data).join(',')
                             updateTraining tx, {is_saved:1}, 'id IN (' + (d['id'] for d in data).join(',') + ')'

saveAllTrainings = (tx) ->
  _l 'saveTrainings'
  selectAllTrainings tx,
                     (tx, res) ->
                       _l res.rows
                       return if not res.rows.length
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

downloadTrainings = (tx, success = _success_func, failure = _failure_func) ->
  _l 'downloadTrainings'
  _get SERVER_BASE_URL + 'dl_trainings',
       (data, status, xhr) -> success data,
       (data, status, xhr) -> failure status

renderDownloadItems = (tx) ->
  _l 'renderDownloadItems'
  downloadItems tx,
                (json_data) ->
                  $('#downloaditems').append objlist2table(json_data)
                  localStorage['_downloaditems'] = JSON.stringify(json_data)

renderDownloadTrainings = (tx) ->
  _l 'renderDownloadTrainings'
  downloadTrainings tx,
                    (json_data) ->
                      $('#downloadtrainings').append objlist2table(json_data)
                      localStorage['_downloadtrainings'] = JSON.stringify(json_data)

saveToLocal = (tx) ->
  _l 'saveToLocal'
  if not confirm('現在のトレーニング種目は削除されて、このサーバのデータに置き換わります。本当によろしいですか？')
    notify 'キャンセルしました'
    return

  _insertDownloadItems =->
    for d in json_data
      insertItem tx, {id: d.item_id, name: d.name, attr: d.attr, is_saved: 1}
    renderItems(tx)

  json_data = JSON.parse(localStorage['_downloaditems'])
  _dropTableItems(tx)
  createTableItems tx, _insertDownloadItems
  notify 'トレーニング種目を書き換えました'

toggleSelectTrainingType =->
  config = getConfig()
  _type = if config['select_trainings_type'] is 1 then 2 else 1
  setConfig({select_trainings_type:_type})
  db.transaction (tx) ->
    renderTodaysTrainings tx
  notify 'トレーニング記録の表示を変更しました'
