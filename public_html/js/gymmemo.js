(function() {

  /*
  # アプリ固有じゃないユーティリティっぽいもの
  */

  var DB_VERSION, SERVER_BASE_URL, addItem, addTraining, checkConfig, createConfig, createTableItems, createTableTrainings, db, debugSelectItems, debugSelectTrainings, debugShowConfig, deleteData, deleteTraining, downloadItems, downloadTrainings, dropTableItems, dropTableTrainings, editItem, getConfig, getUser, getYYYYMMDD, insertData, insertItem, insertTraining, notify, obj2insertSet, obj2updateSet, objlist2table, order, renderDownloadItems, renderDownloadTrainings, renderItemForms, renderItems, renderPastTrainingsDate, renderTodaysTrainings, renderTrainingByDate, saveAllItems, saveAllTrainings, saveItems, saveToLocal, saveTrainings, selectActiveItems, selectAllItems, selectAllTrainings, selectItemById, selectTrainingsByDate, selectTrainingsGroupedItemByDate, selectUnsavedItems, selectUnsavedTrainings, setConfig, setUp, toggleSelectTrainingType, updateData, updateDb, updateItem, updateTraining, wrapHtmlList, xxx, _DEBUG, _dropTableItems, _dropTableTrainings, _failure_func, _get, _l, _obj2keysAndVals, _post, _post_unsaved_items_and_update, _renderRes, _res2Date, _res2ItemAll, _res2ItemAllList, _res2NameValues, _res2TrainingAll, _res2TrainingAllList, _setConfig, _success_func;

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
    _l(success);
    return $.ajax({
      url: url,
      type: 'POST',
      data: data,
      success: success,
      error: failure
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

  /*
  # config
  */

  SERVER_BASE_URL = 'http://gym-memo.appspot.com/';

  SERVER_BASE_URL = 'http://localhost:8080/';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  DB_VERSION = 1;

  order = [' ASC ', ' DESC '];

  _obj2keysAndVals = function(obj) {
    var k, keys, v, vals;
    keys = [];
    vals = [];
    for (k in obj) {
      v = obj[k];
      keys.push(k);
      vals.push(v);
    }
    return [keys, vals];
  };

  obj2insertSet = function(obj) {
    var keys, v, vals, _ref;
    _ref = _obj2keysAndVals(obj), keys = _ref[0], vals = _ref[1];
    return [
      '(' + keys.join(',') + ') values (' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = vals.length; _i < _len; _i++) {
          v = vals[_i];
          _results.push('?');
        }
        return _results;
      })()).join(',') + ')', vals
    ];
  };

  obj2updateSet = function(obj) {
    var k, keys, vals, _ref;
    _ref = _obj2keysAndVals(obj), keys = _ref[0], vals = _ref[1];
    return [
      ' set ' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          k = keys[_i];
          _results.push(k + ' = ?');
        }
        return _results;
      })()).join(','), vals
    ];
  };

  objlist2table = function(objlist) {
    var d, data, h, headers, l, o, table_str, _i, _len;
    headers = _obj2keysAndVals(objlist[0])[0];
    data = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = objlist.length; _i < _len; _i++) {
        o = objlist[_i];
        _results.push(_obj2keysAndVals(o)[1]);
      }
      return _results;
    })();
    table_str = '<tr>' + ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = headers.length; _i < _len; _i++) {
        h = headers[_i];
        _results.push('<th>' + h + '</th>');
      }
      return _results;
    })()).join('') + '</tr>';
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      l = data[_i];
      table_str += '<tr>' + ((function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = l.length; _j < _len2; _j++) {
          d = l[_j];
          _results.push('<td>' + d + '</td>');
        }
        return _results;
      })()).join('') + '</tr>';
    }
    _l(table_str);
    return table_str;
  };

  createTableItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('createTableItems');
    return tx.executeSql('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, attr TEXT, is_saved INT DEFAULT 0 NOT NULL, ordernum INT DEFAULT 0, is_active INTEGER DEFAULT 1)', [], success_func, failure_func);
  };

  createTableTrainings = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('createTableTrainings');
    return tx.executeSql('CREATE TABLE IF NOT EXISTS trainings (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL, value INTEGER NOT NULL, created_at TEXT, is_saved INT DEFAULT 0 NOT NULL)', [], success_func, failure_func);
  };

  selectItemById = function(tx, item_id, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectItemById');
    return tx.executeSql('select * from items where id = ?', [item_id], success_func, failure_func);
  };

  selectActiveItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectActiveItems');
    return tx.executeSql('SELECT * FROM items WHERE is_active = 1 ORDER BY ordernum ASC', [], success_func, failure_func);
  };

  selectAllItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectAllItems');
    return tx.executeSql('SELECT * FROM items ORDER BY ordernum ASC', [], success_func, failure_func);
  };

  selectUnsavedItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectUnsavedItems');
    return tx.executeSql('select * from items where is_saved = 0 order by ordernum asc', [], success_func, failure_func);
  };

  selectUnsavedTrainings = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectUnsavedTrainings');
    return tx.executeSql('SELECT * FROM trainings WHERE is_active = 1 AND is_saved = 0 ORDER BY id ASC', [], success_func, failure_func);
  };

  selectAllTrainings = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectAllTrainings');
    return tx.executeSql('SELECT * FROM trainings ORDER BY id ASC', [], success_func, failure_func);
  };

  selectTrainingsByDate = function(tx, success_func, failure_func) {
    var SELECT_TRAININGS_BY_DATE;
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectTrainingsByDate');
    SELECT_TRAININGS_BY_DATE = 'SELECT tr.id AS id, tr.item_id AS item_id, it.name AS name, tr.value AS value, it.attr AS attr, tr.created_at AS created_at FROM trainings AS tr LEFT JOIN items AS it ON tr.item_id = it.id WHERE tr.is_active = 1 AND tr.created_at = ? ORDER BY tr.id ';
    return tx.executeSql(SELECT_TRAININGS_BY_DATE, [getYYYYMMDD()], success_func, failure_func);
  };

  selectTrainingsGroupedItemByDate = function(tx, success_func, failure_func) {
    var SELECT_TRAININGS_BY_DATE;
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectTrainingsGroupedItemByDate');
    SELECT_TRAININGS_BY_DATE = 'SELECT tr.item_id AS item_id,\
                                     max(it.name) AS name,\
                                     sum(tr.value) AS value,\
                                     max(it.attr) AS attr,\
                                     max(tr.created_at) AS created_at\
                                FROM trainings AS tr\
                           LEFT JOIN items AS it\
                                  ON tr.item_id = it.id\
                               WHERE tr.is_active = 1 AND tr.created_at = ?\
                            GROUP BY tr.item_id\
                            ORDER BY tr.id ';
    return tx.executeSql(SELECT_TRAININGS_BY_DATE, [getYYYYMMDD()], success_func, failure_func);
  };

  insertItem = function(tx, obj, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    return insertData(tx, 'items', obj, success_func, failure_func);
  };

  updateItem = function(tx, obj, where_state, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    return updateData(tx, 'items', obj, where_state, success_func, failure_func);
  };

  insertTraining = function(tx, obj, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    return insertData(tx, 'trainings', obj, success_func, failure_func);
  };

  updateTraining = function(tx, obj, where_state, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    return updateData(tx, 'trainings', obj, where_state, success_func, failure_func);
  };

  insertData = function(tx, table, obj, success_func, failure_func) {
    var params, set, _ref;
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('insertData');
    _ref = obj2insertSet(obj), set = _ref[0], params = _ref[1];
    _l(table);
    _l(set);
    _l(params);
    return tx.executeSql('insert into ' + table + ' ' + set, params, success_func, failure_func);
  };

  updateData = function(tx, table, obj, where_state, success_func, failure_func) {
    var params, set, _ref, _update_state;
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('updateData');
    _ref = obj2updateSet(obj), set = _ref[0], params = _ref[1];
    _update_state = 'update ' + table + ' ' + set + ' where ' + where_state;
    _l(where_state);
    _l(_update_state);
    _l(params);
    return tx.executeSql(_update_state, params, success_func, failure_func);
  };

  deleteData = function(tx, table, where_state, success, failure) {
    var sql;
    if (success == null) success = _success_func;
    if (failure == null) failure = _failure_func;
    _l('deleteData');
    sql = 'UPDATE ' + table + ' SET is_active = 0 WHERE ' + where_state;
    _l(sql);
    return tx.executeSql(sql, [], success, failure);
  };

  deleteTraining = function(ev) {
    var id;
    _l('deleteTraining');
    if (!confirm('削除しますか？')) {
      notify('削除をキャンセルしました');
      return;
    }
    id = ev.target.id.match(/(\d+)/).shift();
    return db.transaction(function(tx) {
      return deleteData(tx, 'trainings', 'id = ' + id, function(tx, res) {
        notify('削除しました');
        return renderTodaysTrainings(tx);
      });
    });
  };

  addItem = function(ev) {
    db.transaction(function(tx) {
      var itemattr, itemname;
      itemname = $('#itemname').attr('value');
      itemattr = $('#itemattr').attr('value');
      return insertItem(tx, {
        name: itemname || null,
        attr: itemattr
      }, function(tx) {
        renderItemForms(tx);
        renderItems(tx);
        $('#itemname').attr('value', '');
        $('#itemattr').attr('value', '');
        return notify(itemname);
      });
    });
    return false;
  };

  editItem = function(ev) {
    var item_id;
    _l('editItem');
    if (!confirm('本当に変更しても良いですか？')) return;
    item_id = ev.target.id.slice(17);
    _l($('#itemsetting' + item_id).attr('value'));
    _l($('#itemattrsetting' + item_id).attr('value'));
    return db.transaction(function(tx) {
      return updateItem(tx, {
        name: $('#itemsetting' + item_id).attr('value') || null,
        attr: $('#itemattrsetting' + item_id).attr('value'),
        is_active: $('#itemactivesetting' + item_id).attr('value')
      }, 'id = ' + item_id, function(tx) {
        renderItemForms(tx);
        return renderItems(tx);
      });
    });
  };

  _renderRes = function(res, jqobj, func) {
    return jqobj.empty().append(func(res));
  };

  renderItemForms = function(tx) {
    var _res2inputElems, _resToForm;
    _l('renderItemForms');
    _res2inputElems = function(res) {
      var i, len, _results;
      len = res.rows.length;
      _results = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        _results.push('<td>' + res.rows.item(i).name + '</td><td><input class="input-small" type="number" id="item' + res.rows.item(i).id + '" />' + res.rows.item(i).attr + '</td>');
      }
      return _results;
    };
    _resToForm = function(res) {
      return wrapHtmlList(_res2inputElems(res), 'tr').join('');
    };
    return selectActiveItems(tx, function(tx, res) {
      return _renderRes(res, $('#itemlist'), _resToForm);
    });
  };

  renderItems = function(tx) {
    var _res2li, _res2string;
    _l('renderItems');
    _res2string = function(res) {
      var classoffbtn, classonbtn, i, id, is_active, item_forms, len, _ref;
      len = res.rows.length;
      item_forms = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        id = res.rows.item(i).id;
        is_active = res.rows.item(i).is_active;
        _ref = is_active === 1 ? [' active ', ''] : ['', ' active '], classonbtn = _ref[0], classoffbtn = _ref[1];
        item_forms.push('<tr class="row">\
                         <td>\
                           <input type="text" id="itemsetting' + id + '" value="' + res.rows.item(i).name + '"/>\
                           <input type="text" id="itemattrsetting' + id + '" value="' + res.rows.item(i).attr + '"/>\
                           <div class="btn-group" data-toggle="buttons-radio">\
                             <button id="itemactivesettingbtnon' + id + '" class="btn itemactivesettingbtnon' + classonbtn + '">On</button>\
                             <button id="itemactivesettingbtnoff' + id + '" class="btn itemactivesettingbtnoff' + classoffbtn + '">Off</button>\
                           </div>\
                           <input type="hidden" id="itemactivesetting' + id + '" value="' + is_active + '"/>\
                           <button class="itemsettingbutton btn" id="itemsettingbutton' + id + '">変更</button>\
                         </td>\
                       </tr>');
      }
      return item_forms;
    };
    _res2li = function(res) {
      return _res2string(res).join('');
    };
    return selectAllItems(tx, function(tx, res) {
      return _renderRes(res, $('#itemlistsetting'), _res2li);
    });
  };

  renderTodaysTrainings = function(tx) {
    var config, _selectTrainings;
    _l('renderTodaysTrainings');
    config = getConfig();
    _selectTrainings = config['select_trainings_type'] === 1 ? selectTrainingsByDate : selectTrainingsGroupedItemByDate;
    return _selectTrainings(tx, function(tx, res) {
      return $('#todaystraininglist').empty().append(_res2NameValues(res, 'todaystraining').join(''));
    });
  };

  renderTrainingByDate = function(ev) {
    var date, _renderTrainingByDate;
    _l('renderTrainingByDate');
    date = ev.target.textContent;
    _renderTrainingByDate = function(tx) {
      var SELECT_TRAININGS_BY_DATE, SELECT_TRAININGS_GROUPED_ITEM__BY_DATE, config, _select_tranings;
      console.log('_renderTrainingByDate');
      config = getConfig();
      SELECT_TRAININGS_BY_DATE = 'SELECT *\
                                      FROM trainings t\
                                 LEFT JOIN items i\
                                        ON t.item_id = i.id\
                                     WHERE t.is_active = 1 AND t.created_at = ?\
                                     ORDER BY t.id ';
      SELECT_TRAININGS_GROUPED_ITEM__BY_DATE = 'SELECT max(t.id) AS id,\
                                                         t.item_id,\
                                                         i.name,\
                                                         sum(t.value) AS value,\
                                                         max(i.attr) AS attr,\
                                                         max(t.created_at) AS created_at\
                                                    FROM trainings t\
                                               LEFT JOIN items i\
                                                      ON t.item_id = i.id\
                                                   WHERE t.is_active = 1 AND t.created_at = ?\
                                                GROUP BY t.item_id\
                                                ORDER BY t.id ';
      config = getConfig();
      _select_tranings = config['select_trainings_type'] === 1 ? SELECT_TRAININGS_BY_DATE : SELECT_TRAININGS_GROUPED_ITEM__BY_DATE;
      _l(_select_tranings);
      return tx.executeSql(_select_tranings, [date], function(tx, res) {
        $('#trainingsubtitle').text(date);
        return $('#pasttraininglist').empty().append(_res2NameValues(res, 'pasttraining').join(''));
      }, _failure_func);
    };
    return db.transaction(_renderTrainingByDate, _failure_func);
  };

  renderPastTrainingsDate = function(tx) {
    var SELECT_TRAININGS_DATE, config, _render;
    _l('_renderPastTrainingsDate');
    config = getConfig();
    _l(config);
    SELECT_TRAININGS_DATE = 'SELECT created_at FROM trainings t LEFT JOIN items i ON t.item_id = i.id WHERE t.is_active = 1 GROUP BY t.created_at ORDER BY t.created_at ' + order[config['past_trainings_order']] + ' LIMIT 10';
    _render = function(tx, res) {
      $('#trainingsubtitle').text('');
      return $('#pasttraininglist').empty().append(wrapHtmlList(_res2Date(res), 'tr').join(''));
    };
    return tx.executeSql(SELECT_TRAININGS_DATE, [], _render, _failure_func);
  };

  _res2NameValues = function(res, pre_id) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push('<tr><td id="' + pre_id + res.rows.item(i).id + '">' + res.rows.item(i).name + '</td><td>' + res.rows.item(i).value + ' ' + res.rows.item(i).attr + '</td></tr>');
    }
    return _results;
  };

  _res2ItemAll = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).id + ' ' + res.rows.item(i).name + ' ' + res.rows.item(i).user + ' ' + res.rows.item(i).attr + ' ' + res.rows.item(i).is_saved);
    }
    return _results;
  };

  _res2ItemAllList = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push({
        id: res.rows.item(i).id,
        name: res.rows.item(i).name,
        user: res.rows.item(i).user,
        attr: res.rows.item(i).attr,
        is_saved: res.rows.item(i).is_saved,
        is_active: res.rows.item(i).is_active,
        ordernum: res.rows.item(i).ordernum
      });
    }
    return _results;
  };

  _res2TrainingAll = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(res.rows.item(i).id + ' ' + res.rows.item(i).item_id + ' ' + res.rows.item(i).value + ' ' + res.rows.item(i).created_at + ' ' + res.rows.item(i).is_saved);
    }
    return _results;
  };

  _res2TrainingAllList = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push({
        id: res.rows.item(i).id,
        item_id: res.rows.item(i).item_id,
        value: res.rows.item(i).value,
        is_saved: res.rows.item(i).is_saved,
        is_active: res.rows.item(i).is_active,
        created_at: res.rows.item(i).created_at
      });
    }
    return _results;
  };

  _res2Date = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push('<td><span>' + res.rows.item(i).created_at + '</span><td>');
    }
    return _results;
  };

  wrapHtmlList = function(list, tag) {
    var l, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      l = list[_i];
      _results.push('<' + tag + '>' + l + '</' + tag + '>');
    }
    return _results;
  };

  addTraining = function(ev) {
    var item_id, value;
    _l('addTraining');
    if (!ev.target.value) return;
    item_id = ev.target.id.slice(4, 8);
    value = ev.target.value;
    db.transaction(function(tx) {
      return insertTraining(tx, {
        item_id: item_id,
        value: value,
        created_at: getYYYYMMDD()
      }, function(tx, res) {
        renderTodaysTrainings(tx);
        $(ev.target).attr('value', '');
        return selectItemById(tx, item_id, function(tx, res) {
          return notify(res.rows.item(0).name + ' ' + value + res.rows.item(0).attr);
        });
      });
    });
    return false;
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

  getUser = function() {
    _l('getUser');
    return $.ajax({
      url: SERVER_BASE_URL + 'user_info',
      type: 'GET',
      success: function(data, status, xhr) {
        _l('success');
        _l(data);
        return _l(status);
      },
      error: function(data, status, xhr) {
        _l('error');
        _l(data);
        return _l(status);
      }
    });
  };

  setUp = function() {
    db.transaction(function(tx) {
      createTableItems(tx);
      createTableTrainings(tx);
      renderItemForms(tx);
      renderTodaysTrainings(tx);
      renderPastTrainingsDate(tx);
      return renderItems(tx);
    });
    createConfig();
    return db.transaction(function(tx) {
      return checkConfig(tx);
    });
  };

  getConfig = function() {
    _l('getConfig');
    return JSON.parse(localStorage['config']);
  };

  setConfig = function(change_config) {
    var config;
    config = getConfig();
    return _setConfig($.extend(config, change_config));
  };

  _setConfig = function(json) {
    _l('_setConfig');
    return localStorage['config'] = JSON.stringify(json);
  };

  createConfig = function() {
    _l('createConfig');
    if (localStorage['config'] != null) return;
    return _setConfig({
      db_version: 0,
      localstrage_version: 0,
      todays_trainings_order: 1,
      past_trainings_order: 1,
      select_trainings_type: 1
    });
  };

  checkConfig = function(tx) {
    var config;
    _l('checkConfig');
    config = getConfig();
    if (!config['db_version'] < DB_VERSION) return;
    return updateDb(tx, config['db_version']);
  };

  updateDb = function(tx, config_db_version) {
    var _updateDb_0_1, _updateDb_1_2, _updateDb_2_3;
    _l('updateDb');
    _updateDb_2_3 = function(tx) {
      _l('_updateDb_2_3');
      return _l('not yet');
    };
    _updateDb_1_2 = function(tx) {
      _l('_updateDb_1_2');
      return _l('not yet');
    };
    _updateDb_0_1 = function(tx) {
      _l('_updateDb_0_1');
      if (config_db_version === 0) {
        return tx.executeSql('ALTER TABLE trainings ADD COLUMN is_active INT DEFAULT 1', [], function(tx) {
          setConfig({
            db_version: 1
          });
          return _updateDb_1_2(tx);
        });
      } else {
        return _updateDb_1_2(tx);
      }
    };
    return _updateDb_0_1(tx);
  };

  xxx = function(res, func) {
    var i, len, _results;
    if (func == null) {
      func = function(x) {
        return x;
      };
    }
    _l('xxx');
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push(_l(func(res.rows.item(i))));
    }
    return _results;
  };

  debugSelectItems = function() {
    _l('debugSelectItems');
    return db.transaction(function(tx) {
      return tx.executeSql('select * from items', [], function(tx, res) {
        return $('#showdb').append(wrapHtmlList(_res2ItemAll(res), 'li').join(''));
      });
    });
  };

  debugSelectTrainings = function() {
    _l('debugSelectTrainings');
    return db.transaction(function(tx) {
      return tx.executeSql('select * from trainings', [], function(tx, res) {
        return $('#showdb').append(wrapHtmlList(_res2TrainingAll(res), 'li').join(''));
      });
    });
  };

  debugShowConfig = function() {
    var config;
    config = getConfig();
    _l(objlist2table([config]));
    return $("#showdb").append(objlist2table([config]));
  };

  dropTableItems = function(tx) {
    if (!confirm('itemsテーブルをdropして良いですか？')) return;
    return _dropTableItems(tx);
  };

  _dropTableItems = function(tx) {
    return tx.executeSql('DROP TABLE items', [], function() {
      return alert('error: dropTableItems');
    }, function() {
      return alert('success: dropTableItems');
    });
  };

  dropTableTrainings = function(tx) {
    if (!confirm('trainingsテーブルをdropして良いですか？')) return;
    return _dropTableTrainings(tx);
  };

  _dropTableTrainings = function(tx) {
    return tx.executeSql('DROP TABLE trainings', [], function() {
      return alert('error: dropTableTrainings');
    }, function() {
      return alert('success: dropTableTrainings');
    });
  };

  _post_unsaved_items_and_update = function(tx, items) {
    return $.ajax({
      url: SERVER_BASE_URL + 'save_item',
      type: 'POST',
      data: JSON.stringify(items),
      complete: function(xhr, status) {
        var d, _where;
        if (status === "success") {
          _l("success");
          _where = 'id IN (' + ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              d = items[_i];
              _results.push(d['id']);
            }
            return _results;
          })()).join(',') + ')';
          _l(_where);
          return updateItem(tx, {
            is_saved: 1
          }, _where);
        } else {
          return _l("[" + status(+"]Item save is failed!"));
        }
      }
    });
  };

  saveItems = function(tx) {
    _l('saveItems');
    return selectUnsavedItems(tx, function(tx, res) {
      var d, data;
      if (!res.rows.length) return;
      data = _res2ItemAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_item', JSON.stringify(data), notify("Items saved."), updateItem(tx, {
        is_saved: 1
      }, 'id IN (' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',') + ')'));
    });
  };

  saveAllItems = function(tx) {
    _l('saveAllItems');
    return selectAllItems(tx, function(tx, res) {
      var d, data;
      if (!res.rows.length) return;
      data = _res2ItemAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_item', JSON.stringify(data), notify("Items saved."), updateItem(tx, {
        is_saved: 1
      }, 'id IN (' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',') + ')'));
    });
  };

  saveTrainings = function(tx) {
    _l('saveTrainings');
    return selectUnsavedTrainings(tx, function(tx, res) {
      var d, data;
      if (!res.rows.length) return;
      data = _res2TrainingAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_training', JSON.stringify(data), notify("Trainings saved."), updateTraining(tx, {
        is_saved: 1
      }, 'id IN (' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',') + ')'));
    });
  };

  saveAllTrainings = function(tx) {
    _l('saveTrainings');
    return selectAllTrainings(tx, function(tx, res) {
      var d, data;
      _l(res.rows);
      if (!res.rows.length) return;
      data = _res2TrainingAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_training', JSON.stringify(data), notify("Trainings saved."), updateTraining(tx, {
        is_saved: 1
      }, 'id IN (' + ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',') + ')'));
    });
  };

  downloadItems = function(tx, success, failure) {
    if (success == null) success = _success_func;
    if (failure == null) failure = _failure_func;
    _l('downloadItems');
    return _get(SERVER_BASE_URL + 'dl_items', function(data, status, xhr) {
      return success(data);
    }, function(data, status, xhr) {
      return failure(status);
    });
  };

  downloadTrainings = function(tx, success, failure) {
    if (success == null) success = _success_func;
    if (failure == null) failure = _failure_func;
    _l('downloadTrainings');
    return _get(SERVER_BASE_URL + 'dl_trainings', function(data, status, xhr) {
      return success(data);
    }, function(data, status, xhr) {
      return failure(status);
    });
  };

  renderDownloadItems = function(tx) {
    _l('renderDownloadItems');
    return downloadItems(tx, function(json_data) {
      $('#downloaditems').append(objlist2table(json_data));
      return localStorage['_downloaditems'] = JSON.stringify(json_data);
    });
  };

  renderDownloadTrainings = function(tx) {
    _l('renderDownloadTrainings');
    return downloadTrainings(tx, function(json_data) {
      $('#downloadtrainings').append(objlist2table(json_data));
      return localStorage['_downloadtrainings'] = JSON.stringify(json_data);
    });
  };

  saveToLocal = function(tx) {
    var json_data, _insertDownloadItems;
    _l('saveToLocal');
    if (!confirm('現在のトレーニング種目は削除されて、このサーバのデータに置き換わります。本当によろしいですか？')) {
      notify('キャンセルしました');
      return;
    }
    _insertDownloadItems = function() {
      var d, _i, _len;
      for (_i = 0, _len = json_data.length; _i < _len; _i++) {
        d = json_data[_i];
        insertItem(tx, {
          id: d.item_id,
          name: d.name,
          attr: d.attr,
          is_saved: 1
        });
      }
      return renderItems(tx);
    };
    json_data = JSON.parse(localStorage['_downloaditems']);
    _dropTableItems(tx);
    createTableItems(tx, _insertDownloadItems);
    return notify('トレーニング種目を書き換えました');
  };

  toggleSelectTrainingType = function() {
    var config, _type;
    config = getConfig();
    _type = config['select_trainings_type'] === 1 ? 2 : 1;
    setConfig({
      select_trainings_type: _type
    });
    db.transaction(function(tx) {
      return renderTodaysTrainings(tx);
    });
    return notify('トレーニング記録の表示を変更しました');
  };

  $(function() {
    setUp();
    $('#itemstitle').on('click touch', function() {
      return $('#itemadd').toggle();
    });
    $('#itemadd button').on('click touch', addItem);
    $(document).on('blur', '#itemlist input', addTraining);
    $(document).on('click touch', '.itemsettingbutton', editItem);
    $(document).on('click', '.itemactivesettingbtnon', function(ev) {
      var id;
      id = '#itemactivesetting' + ev.target.id.match(/(\d+)/).shift();
      return $(id).attr('value', 1);
    });
    $(document).on('click', '.itemactivesettingbtnoff', function(ev) {
      var id;
      id = '#itemactivesetting' + ev.target.id.match(/(\d+)/).shift();
      return $(id).attr('value', 0);
    });
    $('#pasttrainingstitle').on('click touch', function() {
      return db.transaction(function(tx) {
        return renderPastTrainingsDate(tx);
      });
    });
    $(document).on('touchstart', '#pasttraininglist span', renderTrainingByDate);
    $(document).on('click', '#pasttraininglist span', renderTrainingByDate);
    $('#saveToServer').on('click touch', function() {
      return db.transaction(function(tx) {
        saveItems(tx);
        return saveTrainings(tx);
      });
    });
    $('#download').on('click touch', function() {
      return db.transaction(function(tx) {
        renderDownloadItems(tx);
        renderDownloadTrainings(tx);
        return $('#saveToLocal').show();
      });
    });
    $('#saveToLocal').on('click touch', function() {
      return db.transaction(function(tx) {
        return saveToLocal(tx);
      });
    });
    $('#myTab a').on('click touch', function() {
      e.preventDefault();
      return $(this).tab('show');
    });
    $('#todaystraininglist').on('click', deleteTraining);
    $(document).on('click toutch', '#todaystrainingstitle', toggleSelectTrainingType);
    $('.toggle-select-trainings').click(toggleSelectTrainingType);
    $('#debug').on('click touch', function() {
      $('#showdb').toggle();
      $('#clear').toggle();
      $('#test1').toggle();
      $('#test2').toggle();
      return $('#test3').toggle();
    });
    $('#showdb').click(function() {
      debugSelectItems();
      debugSelectTrainings();
      return debugShowConfig();
    });
    $('#clear').click(function() {
      return db.transaction(function(tx) {
        dropTableItems(tx);
        return dropTableTrainings(tx);
      });
    });
    $('#test1').on('click touch', function() {
      _l('test1');
      return db.transaction(function(tx) {
        return tx.executeSql('select * from items left join trainings on items.id = trainings.item_id', [], function(tx, res) {
          return xxx(res, function(x) {
            return x.attr + ':' + x.created_at + ':' + x.item_id + ':' + x.name;
          });
        });
      });
    });
    $('#test2').on('click touch', function() {
      return _l('test2!');
    });
    return $('#test3').on('click touch', function() {
      notify('hoge!');
      return db.transaction(function(tx) {
        return selectAllItems(tx, function(tx, res) {
          var data;
          if (!res.rows.length) return;
          data = _res2ItemAllList(res);
          return $('body').append(JSON.stringify(data));
        });
      });
    });
  });

}).call(this);
