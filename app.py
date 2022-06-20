from flask import Flask, render_template, request
from flask_restful import Api, Resource
from flask_paginate import Pagination, get_page_args
from collections import OrderedDict
import json
import random
from datetime import datetime
from math import floor as flr
import isodate
import re

app = Flask(__name__)

with open('videos.json', 'r', encoding='utf-8') as f:
    data_random = json.load(f)

def get_converted(unit, unit_str=''):
    return f'{unit} {unit_str}s ago' if unit > 1 else f'{unit} {unit_str} ago'

def rnd(x):
    return round(x)

def get_date(date):
    s = rnd(abs(datetime.now() - date).total_seconds())
    m = rnd(s / 60)
    h = rnd(m / 60)
    D = rnd(h / 24)
    W = rnd(D / 7)
    M = rnd(W / 4)
    Y = flr(M / 12)
    if s < 60: return get_converted(s, 'second')
    elif m < 60: return get_converted(m, 'minute')
    elif h < 24: return get_converted(h, 'hour')
    elif D < 7: return get_converted(D, 'day')
    elif W < 4: return get_converted(W, 'week')
    elif M < 12: return get_converted(M, 'month')
    return get_converted(Y, 'year')

for video in data_random:
    duration = isodate.parse_duration(video['duration'])
    total = int(duration.total_seconds())
    dt = datetime.strptime(f'{int(total / 3600)}:{int((total % 3600) / 60)}:{(total % 3600) % 60}', '%H:%M:%S')
    video['duration'] = datetime.strftime(dt, "%H:%M:%S")
    # video['duration'] = re.search('[1-9]+.+', dur).group()

data_sorted_views_descending = sorted(data_random, reverse=True, key=lambda d: d['viewCount'])
data_sorted_views_ascending = data_sorted_views_descending[::-1]

data_sorted_date_descending = sorted(data_random, key=lambda d: datetime.strptime(d['dateCreated'], '%Y-%m-%dT%H:%M:%SZ'))
data_sorted_date_ascending = data_sorted_date_descending[::-1]

data_sorted_duration_descending = sorted(data_random, reverse=True, key=lambda d: datetime.strptime(d['duration'], '%H:%M:%S'))
data_sorted_duration_ascending = data_sorted_duration_descending[::-1]

data_sorted_ratio_descending = sorted(data_random, reverse=True, key=lambda d: d['ratio'])
data_sorted_ratio_ascending = data_sorted_ratio_descending[::-1]

def get_data(data, offset, per_page):
    return data[offset: offset + per_page]

def render_page(data):
    for video in data:
        video['duration'] = re.search('[1-9]+.+', video['duration']).group()
    dates = [datetime.strptime(date['dateCreated'], '%Y-%m-%dT%H:%M:%SZ') for date in data]
    for index, (video, date) in enumerate(zip(data, dates)):
        video['timeDelta'] = get_date(date)
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
    per_page = 24
    offset = (page - 1) * per_page
    pagination_videos = get_data(data, offset, per_page)
    pagination = Pagination(page=page, per_page=per_page, total=len(data))
    return render_template(
        'index.html',
        data=pagination_videos,
        page=page,
        per_page=per_page,
        pagination=pagination,
        total=pagination.total_pages,
    )

@app.route('/')
def index():
    # random.shuffle(data_random)
    return render_page(data_random)

@app.route('/views-descending')
def views_descending():
    return render_page(data_sorted_views_descending)

@app.route('/views-ascending')
def views_ascending():
    return render_page(data_sorted_views_ascending)

@app.route('/date-descending')
def date_descending():
    return render_page(data_sorted_date_descending)

@app.route('/date-ascending')
def date_ascending():
    return render_page(data_sorted_date_ascending)

@app.route('/longest')
def duration_descending():
    return render_page(data_sorted_duration_descending)

@app.route('/shortest')
def duration_ascending():
    return render_page(data_sorted_duration_ascending)

@app.route('/ratio-descending')
def ratio_descending():
    return render_page(data_sorted_ratio_descending)

@app.route('/ratio-ascending')
def ratio_ascending():
    return render_page(data_sorted_ratio_ascending)

@app.route('/search')
def search():
    return render_template('search.html', data=data_random)

if __name__ == '__main__':
    app.run(debug=True)