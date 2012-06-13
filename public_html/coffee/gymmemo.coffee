$ ->
  setUp()

  $('#itemstitle').on 'click touch', -> $('#itemadd').toggle()
  $('#itemadd button').on 'click touch', addItem
  $(document).on 'blur', '#itemlist input', addTraining
  $(document).on 'click touch', '.itemsettingbutton', editItem
  $(document).on 'click', '.itemactivesettingbtnon', (ev) ->
    id = '#itemactivesetting' + ev.target.id.match(/(\d+)/).shift()
    $(id).attr('value', 1)
  $(document).on 'click', '.itemactivesettingbtnoff', (ev) ->
    id = '#itemactivesetting' + ev.target.id.match(/(\d+)/).shift()
    $(id).attr('value', 0)

  $('#pasttrainingstitle').on 'click touch', ->
    db.transaction (tx) -> renderPastTrainingsDate tx

  $(document).on 'touchstart', '#pasttraininglist span', renderTrainingByDate
  $(document).on 'click', '#pasttraininglist span', renderTrainingByDate
#   $(document).on 'touchstart click', '#settingtitle', -> $('#setting').toggle()

  $('#saveToServer').on 'click touch', ->
    db.transaction (tx) ->
#       saveItems(tx)
      saveAllItems(tx)
      saveAllTrainings(tx)

  $('#download').on 'click touch', ->
    db.transaction (tx) ->
      renderDownloadItems(tx)
      renderDownloadTrainings(tx)
      $('#saveToLocal').show()

  $('#saveToLocal').on 'click touch', ->
    db.transaction (tx) -> saveToLocal tx

  $('#myTab a').on 'click touch', ->
    e.preventDefault();
    $(this).tab('show');

  $('#todaystraininglist').on 'click', deleteTraining
  $(document).on 'click toutch', '#todaystrainingstitle', toggleSelectTrainingType
  $('.toggle-select-trainings').click toggleSelectTrainingType

#   $('#socialpostsubmit').click fb_feed_post

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
    debugShowConfig()
  $('#clear').click ->
    db.transaction (tx) ->
      dropTableItems(tx)
      dropTableTrainings(tx)

  $('#test1').on 'click touch', ->
    _l 'test1'
    db.transaction (tx) ->
      tx.executeSql 'select * from items left join trainings on items.id = trainings.item_id', [],
                    (tx, res) -> xxx(res, (x) -> x.attr + ':' + x.created_at + ':' + x.item_id + ':' + x.name)

  $('#test2').on 'click touch', ->
    _l 'test2!'

  $('#test3').on 'click touch', ->
    notify('hoge!')
    db.transaction (tx) ->
      selectAllItems tx,
                     (tx, res) ->
                       return if not res.rows.length
                       data = _res2ItemAllList(res)
                       $('body').append JSON.stringify(data)

