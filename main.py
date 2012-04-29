#!/usr/bin/env python
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

class Item(db.Model):
    u"""トレーニング種目
     """
    item_id    = db.IntegerProperty(required=True)
    status     = db.BooleanProperty(default=True)
    created_at = db.DateTimeProperty(auto_now_add=True)
    user       = db.EmailProperty(required=True)
    name       = db.TextProperty(required=True) # 種目名
    attr       = db.TextProperty(required=False) # 負荷単位名


class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('Hello world!')

    def post(self):
        logging.info(self.request.POST.items())

class SaveItem(webapp2.RequestHandler):
    def post(self):
        items = self.request.POST.items()
        logging.info(items)


app = webapp2.WSGIApplication([('/', MainHandler),
                               ('/save_item', SaveItem),
                               ],
                              debug=True)
