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


class Item(SsModel):
    u"""トレーニング種目
    """
    item_id    = db.IntegerProperty(required=True)
    is_active  = db.BooleanProperty(default=True)
    created_at = db.DateTimeProperty(auto_now_add=True)
    user       = db.UserProperty(required=True)
    name       = db.TextProperty(required=True)
    attr       = db.TextProperty(required=False)
    ordernum   = db.IntegerProperty(required=False, default=0)

class Training(SsModel):
    u"""トレーニング記録
    """
    training_id  = db.IntegerProperty(required=True)
    is_active  = db.BooleanProperty(default=True)
    item_id    = db.IntegerProperty(required=True)
    created_at = db.DateTimeProperty(auto_now_add=True)
    user       = db.UserProperty(required=True)
    value       = db.IntegerProperty(required=True)

#
# actions
#
class MainHandler(webapp2.RequestHandler):
    def get(self):
        c = Cookie.SimpleCookie()
#         c['user'] = 'hogehgoe'
#         print c
        logging.info(dir(c))
        logging.info(c.get('user').value)
        self.response.out.write('Hello world!')

    def post(self):
        logging.info(self.request.POST.items())

class Index(webapp2.RequestHandler):
    @login_required
    def get(self):
        logging.info(self.user)
        path = os.path.join(os.path.dirname(__file__), 'public_html/index.html')
        self.response.out.write(template.render(path, {}))

class SaveItem(webapp2.RequestHandler):
    @login_required
    def post(self):
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

class SaveTraining(webapp2.RequestHandler):
    @login_required
    def post(self):
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
                user        = self.user)
            its.append(it)
        db.put(its)

class DownloadItems(webapp2.RequestHandler):
    @login_required
    def get(self):
        items = json.dumps([{'name':it.name, 'attr':it.attr, 'item_id':it.item_id, 'ordernum':it.ordernum} for it in Item.all_by_user(self.user)])
#         logging.info(items)
        self.response.out.write(items)


app = webapp2.WSGIApplication([('/', Index),
                               ('/save_item', SaveItem),
                               ('/save_training', SaveTraining),
                               ('/dl_items', DownloadItems),
                               ],
                              debug=True)
