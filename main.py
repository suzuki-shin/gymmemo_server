# -*- coding: utf-8 -*-
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
DEVELOPER_MAIL = "shinichiro.su@gmail.com"

import os
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
# from django.utils import simplejson as json
import logging
import inspect
import webapp2
import json
import hashlib
import Cookie
from datetime import datetime
import sys

#
# decorators
#
def login_required(function):
    def _loging_required(arg):
        user = users.get_current_user()
        if not user:
            arg.redirect(users.create_login_url(arg.request.uri))

        arg.user = user
        res = function(arg)
        return res
    return _loging_required

#
# models
#
class SsModel(db.Model):
    @classmethod
    def all_by_user(cls, user):
        return cls.all().filter('user =', user).fetch(100)

    @classmethod
    def jsonize(cls, data):
        u"""cls.all()等で取得したデータを渡して、JSONにして返す
        """
        pnames = cls.properties().keys()
        logging.info(pnames)
        d = [dict(zip(pnames, [unicode(a.__getattribute__(p)) for p in pnames])) for a in data]
        logging.info(d)
        return d

class Item(SsModel):
    u"""トレーニング種目
    """
    item_id    = db.IntegerProperty(required=True)
    is_active  = db.BooleanProperty(default=True)
    user       = db.UserProperty(required=True)
    name       = db.TextProperty(required=True)
    attr       = db.TextProperty(required=False)
    ordernum   = db.IntegerProperty(required=False, default=0)

class Training(SsModel):
    u"""トレーニング記録
    """
    training_id = db.IntegerProperty(required=True)
    is_active   = db.BooleanProperty(default=True)
    item_id     = db.IntegerProperty(required=True)
    created_at  = db.DateTimeProperty(required=True)
    user        = db.UserProperty(required=True)
    value       = db.IntegerProperty(required=True)

#
# actions
#
class Index(webapp2.RequestHandler):
    @login_required
    def get(self):
#         logging.info(self.user)
        path = os.path.join(os.path.dirname(__file__), 'public_html/index.html')
        self.response.out.write(template.render(path, {}))

class SaveItem(webapp2.RequestHandler):
    @login_required
    def post(self):
        try:
#             raise
            items = self.request.POST.items()
            its = []
            logging.info(items[0][0])
            for i, item in enumerate(json.loads(items[0][0])):
                logging.info(item['id'])
                logging.info(self.user)
                it = Item(
                    key_name  = hashlib.sha1(str(self.user)).hexdigest() + '__item' + str(item['id']),
                    item_id   = int(item['id']),
                    name      = item['name'],
                    user      = self.user)
                attr = item.get('attr', '')
                if attr: it.attr = attr
                ordernum = item.get('ordernum', 0)
                if ordernum: it.ordernum = int(ordernum)
                is_active = item.get('is_active', False)
                if is_active: it.is_active = bool(is_active)
                its.append(it)
            db.put(its)
        except:
            logging.error("Unexpected error:"+ sys.exc_info()[0])
            self.response.clear()
            self.response.set_status(500)
            self.response.out.write("This operation could not be completed in time...")

class SaveTraining(webapp2.RequestHandler):
    @login_required
    def post(self):
        try:
            trainings = self.request.POST.items()
            its = []
            logging.info(trainings[0][0])
            for i, training in enumerate(json.loads(trainings[0][0])):
                logging.info(training['id'])
                logging.info(self.user)

                it = Training(
                    key_name  = hashlib.sha1(str(self.user)).hexdigest() + '__training' + str(training['id']),
                    training_id = int(training['id']),
                    item_id     = int(training['item_id']),
                    value       = int(training['value']),
                    created_at  = datetime.strptime(training['created_at'], "%Y/%m/%d"),
                    user        = self.user)
                its.append(it)
            db.put(its)
        except:
            logging.error("Unexpected error:"+ sys.exc_info()[0])
            self.response.clear()
            self.response.set_status(500)
            self.response.out.write("This operation could not be completed in time...")

class DownloadItems(webapp2.RequestHandler):
    @login_required
    def get(self):
        items = json.dumps([{'name':it.name, 'attr':it.attr, 'item_id':it.item_id, 'ordernum':it.ordernum, 'is_active':it.is_active} for it in Item.all_by_user(self.user)])
        logging.info(items)
        self.response.out.write(items)

class DownloadTrainings(webapp2.RequestHandler):
    @login_required
    def get(self):
        trainings = json.dumps([{'training_id':tr.training_id, 'item_id':tr.item_id, 'value':tr.value, 'is_active':tr.is_active} for tr in Training.all_by_user(self.user)])
        logging.info(trainings)
        self.response.out.write(trainings)

class TestSave(webapp2.RequestHandler):
    @login_required
    def get(self):
#         items = '[{"id":1,"name":"ウォーキング","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":2,"name":"ランニング","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":3,"name":"ストレッチ","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":4,"name":"レッグプレス 17.5kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":5,"name":"チェストプレス 5kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":6,"name":"フロントプルダウン 14.5kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":7,"name":"腹筋","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":8,"name":"バイク","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":9,"name":"バックプルダウン 12kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":10,"name":"バックエクステンション 19kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":11,"name":"バックプルダウン 14.5kg","attr":"回","is_saved":1,"is_active":1,"ordernum":0},{"id":12,"name":"ストレッチ","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":13,"name":"こぐ","attr":"分","is_saved":1,"is_active":1,"ordernum":0},{"id":14,"name":"腕立て伏せ","attr":"回","is_saved":1,"is_active":1,"ordernum":0}]'
#         items = Item.jsonize(Item.all_by_user(self.user))
        logging.info(items)
        its = []
        for i, item in enumerate(json.loads(items)):
            logging.info(item['id'])
            logging.info(self.user)
            it = Item(
                key_name  = hashlib.sha1(str(self.user)).hexdigest() + '__item' + str(item['id']),
                item_id   = int(item['id']),
                name      = item['name'],
                user      = self.user)
            attr = item.get('attr', '')
            if attr: it.attr = attr
            ordernum = item.get('ordernum', 0)
            if ordernum: it.ordernum = int(ordernum)
            is_active = item.get('is_active', False)
            if is_active: it.is_active = bool(is_active)

            its.append(it)
        db.put(its)

    def post(self):
        logging.info(self.request.POST.items())

class Server(webapp2.RequestHandler):
    @login_required
    def get(self):
        items = {}
        for i in Item.all_by_user(self.user):
            logging.info(i.item_id)
            logging.info(i.name)
            items[i.item_id] = i

        trainings = []
        for t in Training.all_by_user(self.user):
            t.name = items[t.item_id].name
            logging.info(items[t.item_id].name)
            t.attr = items[t.item_id].attr
            logging.info(t.name)
            trainings.append(t)

        logging.info(items)
        logging.info(trainings)

        path = os.path.join(os.path.dirname(__file__), 'public_html/server.html')
        self.response.out.write(template.render(path, {'items':items,
                                                       'trainings':trainings}))

class Test(webapp2.RequestHandler):
    @login_required
    def get(self):
        items = Item.jsonize(Item.all_by_user(self.user))
        logging.info(items)
        self.response.out.write(items)

    def post(self):
        logging.info(self.request.POST.items())

app = webapp2.WSGIApplication([('/', Index),
                               ('/index', Index),
                               ('/save_item', SaveItem),
                               ('/save_training', SaveTraining),
                               ('/dl_items', DownloadItems),
                               ('/dl_trainings', DownloadTrainings),
                               ('/server', Server),
                               ('/test', Test),
                               ('/test_save', TestSave),
                               ],
                              debug=True)
