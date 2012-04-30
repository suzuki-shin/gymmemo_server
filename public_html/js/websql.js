(function() {

  /*
  # config
  */

  var SERVER_BASE_URL, addItem, addTraining, createConfig, createTableItems, createTableTrainings, db, debugSelectItems, debugSelectTrainings, dropTableItems, dropTableTrainings, editItem, getConfig, getUser, getYYYYMMDD, insertData, insertItem, insertTraining, obj2insertSet, obj2updateSet, order, renderItemForms, renderItems, renderPastTrainingsDate, renderTodaysTrainings, renderTrainingByDate, saveItems, saveTrainings, selectItems, selectTrainingsByDate, selectUnsavedItems, selectUnsavedTrainings, setConfig, setUp, updateData, updateItem, updateTraining, wrapHtmlList, xxx, _DEBUG, _failure_func, _l, _obj2keysAndVals, _post, _renderRes, _res2Date, _res2ItemAll, _res2ItemAllList, _res2NameValues, _res2TrainingAll, _res2TrainingAllList, _setConfig, _success_func;

  _DEBUG = true;

  SERVER_BASE_URL = 'http://gymmemoserver.appspot.com/';

  db = window.openDatabase("gymmemo", "", "GYMMEMO", 1048576);

  order = [' ASC ', ' DESC '];

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

  _obj2keysAndVals = function(obj) {
    var k, keys, v, vals;
    _l(obj);
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

  selectItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectItems');
    return tx.executeSql('select * from items order by ordernum asc', [], success_func, failure_func);
  };

  selectUnsavedItems = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectItems');
    return tx.executeSql('select * from items where is_saved = 0 order by ordernum asc', [], success_func, failure_func);
  };

  selectUnsavedTrainings = function(tx, success_func, failure_func) {
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectTrainings');
    return tx.executeSql('select * from trainings where is_saved = 0 order by id asc', [], success_func, failure_func);
  };

  selectTrainingsByDate = function(tx, success_func, failure_func) {
    var SELECT_TRAININGS_BY_DATE;
    if (success_func == null) success_func = _success_func;
    if (failure_func == null) failure_func = _failure_func;
    _l('selectTrainingsByDate');
    SELECT_TRAININGS_BY_DATE = 'SELECT tr.item_id AS item_id, it.name AS name, tr.value AS value, it.attr AS attr, tr.created_at AS created_at FROM trainings AS tr LEFT JOIN items AS it ON tr.item_id = it.id WHERE tr.created_at = ? ORDER BY tr.id ';
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

  addItem = function(ev) {
    db.transaction(function(tx) {
      return insertItem(tx, {
        name: $('#itemname').attr('value') || null,
        attr: $('#itemattr').attr('value')
      }, function(tx) {
        renderItemForms(tx);
        $('#itemname').attr('value', '');
        return $('#itemattr').attr('value', '');
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
        attr: $('#itemattrsetting' + item_id).attr('value')
      }, 'id = ' + item_id, renderItemForms);
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
        _results.push('<td>' + res.rows.item(i).name + '</td><td><input class="input-small" type="number" id="item' + res.rows.item(i).id + '" size="3" />' + res.rows.item(i).attr + '</td>');
      }
      return _results;
    };
    _resToForm = function(res) {
      return wrapHtmlList(_res2inputElems(res), 'tr').join('');
    };
    return selectItems(tx, function(tx, res) {
      return _renderRes(res, $('#itemlist'), _resToForm);
    });
  };

  renderItems = function(tx) {
    var _res2li, _res2string;
    _l('renderItems');
    _res2string = function(res) {
      var i, id, item_forms, len;
      len = res.rows.length;
      item_forms = [];
      for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
        id = res.rows.item(i).id;
        item_forms.push('<input type="text" id="itemsetting' + id + '" value="' + res.rows.item(i).name + '"/><input style="width:20px" type="text" id="itemattrsetting' + res.rows.item(i).id + '" value="' + res.rows.item(i).attr + '"/><button class="itemsettingbutton" id="itemsettingbutton' + id + '">変更</button>');
      }
      return item_forms;
    };
    _res2li = function(res) {
      return wrapHtmlList(_res2string(res), 'li').join('');
    };
    return selectItems(tx, function(tx, res) {
      return _renderRes(res, $('#itemlistsetting'), _res2li);
    });
  };

  renderTodaysTrainings = function(tx) {
    _l('renderTodaysTrainings');
    return selectTrainingsByDate(tx, function(tx, res) {
      return $('#todaystraininglist').empty().append(wrapHtmlList(wrapHtmlList(_res2NameValues(res), 'td'), 'tr').join(''));
    });
  };

  renderTrainingByDate = function(ev) {
    var date, _renderTrainingByDate;
    _l('renderTrainingByDate');
    date = ev.target.textContent;
    _renderTrainingByDate = function(tx) {
      var SELECT_TRAININGS_BY_DATE, config;
      console.log('_renderTrainingByDate');
      config = getConfig();
      SELECT_TRAININGS_BY_DATE = 'SELECT * FROM trainings t LEFT JOIN items i ON t.item_id = i.id WHERE t.created_at = ? ORDER BY t.id ';
      return tx.executeSql(SELECT_TRAININGS_BY_DATE, [date], function(tx, res) {
        $('#trainingsubtitle').text(date);
        return $('#pasttraininglist').empty().append(wrapHtmlList(wrapHtmlList(_res2NameValues(res), 'td'), 'tr').join(''));
      }, _failure_func);
    };
    return db.transaction(_renderTrainingByDate, _failure_func);
  };

  renderPastTrainingsDate = function(tx) {
    var SELECT_TRAININGS_DATE, config;
    _l('_renderPastTrainingsDate');
    config = getConfig();
    _l(config);
    SELECT_TRAININGS_DATE = 'SELECT created_at FROM trainings t LEFT JOIN items i ON t.item_id = i.id GROUP BY t.created_at ORDER BY t.created_at ' + order[config['past_trainings_order']] + ' LIMIT 10';
    return tx.executeSql(SELECT_TRAININGS_DATE, [], function(tx, res) {
      $('#trainingsubtitle').text('');
      return $('#pasttraininglist').empty().append(wrapHtmlList(wrapHtmlList(_res2Date(res), 'td'), 'tr').join(''));
    }, _failure_func);
  };

  _res2NameValues = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push('<td>' + res.rows.item(i).name + '</td><td>' + res.rows.item(i).value + ' ' + res.rows.item(i).attr + '</td>');
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
        is_active: res.rows.item(i).is_active
      });
    }
    return _results;
  };

  _res2Date = function(res) {
    var i, len, _results;
    len = res.rows.length;
    _results = [];
    for (i = 0; 0 <= len ? i < len : i > len; 0 <= len ? i++ : i--) {
      _results.push('<span>' + res.rows.item(i).created_at + '</span>');
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
    var item_id;
    _l('addTraining');
    if (!ev.target.value) return;
    item_id = ev.target.id.slice(4, 8);
    db.transaction(function(tx) {
      return insertTraining(tx, {
        item_id: item_id,
        value: ev.target.value,
        created_at: getYYYYMMDD()
      }, function(tx, res) {
        renderTodaysTrainings(tx);
        return $(ev.target).attr('value', '');
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
    if (dd.length < 10) dd = '0' + dd;
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
    _l('setUp');
    db.transaction(function(tx) {
      createTableItems(tx);
      createTableTrainings(tx);
      renderItemForms(tx);
      renderTodaysTrainings(tx);
      renderPastTrainingsDate(tx);
      renderItems(tx);
      return $('#setting').hide();
    });
    return createConfig();
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
      past_trainings_order: 1
    });
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

  dropTableItems = function() {
    if (!confirm('itemsテーブルをdropして良いですか？')) return;
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE items', [], function() {
        return alert('error: dropTableItems');
      }, function() {
        return alert('success: dropTableItems');
      });
    });
  };

  dropTableTrainings = function() {
    if (!confirm('trainingsテーブルをdropして良いですか？')) return;
    alert('iii');
    return db.transaction(function(tx) {
      return tx.executeSql('DROP TABLE trainings', [], function() {
        return alert('error: dropTableTrainings');
      }, function() {
        return alert('success: dropTableTrainings');
      });
    });
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

  saveItems = function(tx) {
    _l('saveItems');
    return selectUnsavedItems(tx, function(tx, res) {
      var d, data;
      data = _res2ItemAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_item', JSON.stringify(data), _l(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',')), updateItem(tx, {
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
      data = _res2TrainingAllList(res);
      _l(JSON.stringify(data));
      return _post(SERVER_BASE_URL + 'save_training', JSON.stringify(data), _l(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          d = data[_i];
          _results.push(d['id']);
        }
        return _results;
      })()).join(',')), updateTraining(tx, {
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

  $(function() {
    setUp();
    $('#itemstitle').on('click touch', function() {
      return $('#itemadd').toggle();
    });
    $('#itemadd button').on('click touch', addItem);
    $(document).on('blur', '#itemlist input', addTraining);
    $(document).on('click touch', '.itemsettingbutton', editItem);
    $('#pasttrainingstitle').on('click touch', function() {
      return db.transaction(function(tx) {
        return renderPastTrainingsDate(tx);
      });
    });
    $(document).on('touchstart', '#pasttraininglist span', renderTrainingByDate);
    $(document).on('click', '#pasttraininglist span', renderTrainingByDate);
    $(document).on('touchstart click', '#settingtitle', function() {
      return $('#setting').toggle();
    });
    $('#debug').on('click touch', function() {
      $('#showdb').toggle();
      $('#clear').toggle();
      $('#test1').toggle();
      $('#test2').toggle();
      return $('#test3').toggle();
    });
    $('#showdb').click(function() {
      debugSelectItems();
      return debugSelectTrainings();
    });
    $('#clear').click(function() {
      dropTableItems();
      return dropTableTrainings();
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
      _l('test2!');
      return db.transaction(function(tx) {
        saveItems(tx);
        return saveTrainings(tx);
      });
    });
    return $('#test3').on('click touch', function() {
      alert('hik');
      _l('test333', alert);
      return _l('test334');
    });
  });

}).call(this);
