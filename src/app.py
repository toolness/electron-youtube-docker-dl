import os
from rq import Queue
from redis import Redis
from flask import Flask, render_template, request

import tasks

redis_conn = Redis(host=os.environ['REDIS_HOST'])
q = Queue(connection=redis_conn)

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    url = None
    if request.method == 'POST':
        url = request.form['url']
        q.enqueue(tasks.download, url)
    return render_template('index.html', url=url)
