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
from ConfigParser import SafeConfigParser as ConfigParser
# from django.utils import simplejson as json
import logging
import inspect
import webapp2
import json
import hashlib
import Cookie
import urllib
import urllib2

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

class Config(SsModel):
    u"""アプリ設定
    """
    facebook_app_id = db.TextProperty()
    facebook_app_secret = db.TextProperty()

    @classmethod
    def get_conf(cls):
        cs = cls.all().fetch(1)
        return cs[0]

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
    training_id = db.IntegerProperty(required=True)
    is_active   = db.BooleanProperty(default=True)
    item_id     = db.IntegerProperty(required=True)
    created_at  = db.DateTimeProperty(auto_now_add=True)
    user        = db.UserProperty(required=True)
    value       = db.IntegerProperty(required=True)

#
# actions
#
class Index(webapp2.RequestHandler):
    @login_required
    def get(self):
        c = Config(
            facebook_app_id  = '389000681145540',
            facebook_app_secret = 'e16edb4ca11f7bcd034914d6fd7f75bc',
            )
        c.put()

#         configs = Config.all().fetch(1)
#         logging.info(configs)
        config = Config.get_conf()
        FB_CLIENT_ID = str(config.facebook_app_id)
        FB_AUTH_URL = 'https://graph.facebook.com/oauth/authorize?client_id='+ FB_CLIENT_ID +'&redirect_uri='+ self.request.host_url +'/fb_auth&scope=offline_access,publish_stream'
#         FB_AUTH_URL = 'https://graph.facebook.com/oauth/authorize?client_id='+ FB_CLIENT_ID +'&redirect_uri='+ 'http://2.gym-memo.com' +'/fb_auth&scope=offline_access,publish_stream'
        logging.info(FB_AUTH_URL)
        path = os.path.join(os.path.dirname(__file__), 'public_html/index.html')
        self.response.out.write(template.render(path, {'fb_url':FB_AUTH_URL}))

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
            is_active = training.get('is_active', False)
            if is_active: it.is_active = bool(is_active)
            its.append(it)
        db.put(its)

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

class Server(webapp2.RequestHandler):
    @login_required
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'public_html/server.html')
        logging.info(self.user)
        self.response.out.write(template.render(path, {'user':self.user}))

class FacebookAuth(webapp2.RequestHandler):
    def get(self):
#         fb_auth_url = 'https://graph.facebook.com/oauth/authorize'

#         items = Item.jsonize(Item.all_by_user(self.user))

        access_token = self.request.get('access_token')
        if access_token:
            logging.info('access_token: '+ access_token)
        else:
            config = Config.get_conf()
            post_data = {}
            post_data['client_id'] = str(config.facebook_app_id)
            post_data['redirect_uri'] = self.request.host_url + '/fb_auth'
            post_data['client_secret'] = str(config.facebook_app_secret)
            post_data['code'] = self.request.get('code')
            logging.info(post_data)
#         en_post_data = urllib.urlencode(post_data)
#         r1 = urllib2.urlopen('https://graph.facebook.com/oauth/access_token',en_post_data)
#        r1 = urllib2.urlopen('http://2.gym-memo.appspot.com/test',en_post_data)
#         read = r1.read()
#         access_token= read.split("=")[1]

#         logging.info(access_token)
#         logging.info(en_post_data)
        self.response.out.write('xxxx')

    def post(self):
        logging.info(self.request.POST.items())

class Test(webapp2.RequestHandler):
    @login_required
    def get(self):
        logging.info(dir(self.request))
        logging.info(self.request.host)
        logging.info(self.request.host_url)
#         r1 = urllib2.urlopen('http://yahoo.co.jp')
#         read = r1.read()
#         logging.info(read)
        self.response.out.write('test: ')

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
                               ('/fb_auth', FacebookAuth),
                               ],
                              debug=True)
