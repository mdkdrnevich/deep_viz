from flask import Flask, render_template, url_for, jsonify, request, redirect
import deep_learning.utils.dataset as ds
from utils import experiment_to_dict
from tempfile import TemporaryFile
import json

app = Flask(__name__)

queries = {"dataset": [],
           "format": []}
cache = {}

@app.route('/')
def index():
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    datasets = ds.get_available_datasets()
    params = dict(map( lambda dset: (dset, ds.get_experiments_from_dataset(dset)), datasets))
    return render_template("dashboard.html", py_datasets=params)

@app.route('/data/')
@app.route('/data/<dataset>/<format>')
def data(dataset=None, format=None):
    args = request.args
    dataset, format = (dataset, format) if dataset and format else (args["dataset"], args["format"])
    if dataset not in queries["dataset"] or format not in queries["format"]:
        queries["dataset"].append(dataset)
        queries["format"].append(format)
        temp = TemporaryFile('r+b')
        d = experiment_to_dict(dataset+'/'+format)
        temp.write(json.dumps(d))
        temp.truncate()
        if dataset not in cache:
            cache[dataset] = {}
        cache[dataset][format] = temp
    else:
        cache[dataset][format].seek(0)
        d = json.loads(cache[dataset][format].read())

    if dataset and format:
        return jsonify(**d)
    else:
        return jsonify()

if __name__ == "__main__":
    app.run(debug=True)