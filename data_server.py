from flask import Flask, jsonify, request
from flask_cors import cross_origin
from utils import experiment_to_dict
from tempfile import TemporaryFile
import json

app = Flask(__name__)

queries = {"dataset": [],
           "format": []}
cache = {}

@app.route('/')
@cross_origin()
def root():
    args = request.args
    dataset, format = args["dataset"], args["format"]
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
    app.run(port=8080, debug=True)