from flask import Flask, render_template, url_for, jsonify
import deep_learning.utils.dataset as ds

app = Flask(__name__)

@app.route('/dashboard')
def dashboard():
    datasets = ds.get_available_datasets()
    params = dict(map( lambda dset: (dset, ds.get_experiments_from_dataset(dset)), datasets))
    return render_template("dashboard.html", py_datasets=params)

if __name__ == "__main__":
    app.run(debug=True)