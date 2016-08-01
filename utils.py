from __future__ import division
from deep_learning.protobuf import load_experiment
from deep_learning.models import load_model
from deep_learning.utils.dataset import load_dataset
from math import ceil
import numpy as np
import json
from sys import getsizeof

def experiment_to_dict(experiment):
    """ This loads an experiment and returns the experiment as a JSON object """
    e = load_experiment(experiment)
    # All of the elements stored in an experiment:
    # start_date_time = e.start_date_time
    # end_date_time = e.end_date_time
    # structure = e.structure (list of layers)
    #   layer.input_dimension
    #   layer.output_dimension
    #   layer.type
    # results = e.results
    #   epoch.num_seconds
    #   epoch.train_loss
    #   epoch.test_loss
    #   epoch.train_accuracy
    #   epoch.test_accuracy
    #   epoch.s_b
    #   epoch.auc
    #   epoch.curve
    #       curve.signal
    #       curve.background
    #       curve.cutoff
    #   epoch.matrix
    #       matrix[row].columns[columns]
    # batch_size = e.batch_size

    d = dict([[f[0].name, f[1]] for f in e.ListFields()])

    # Convert dataset
    d["dataset"] = e.Dataset.Name(e.dataset)
    d["description"] = e.description
    d["format"] = e.coordinates if '/' in e.coordinates else '/'.join(e.coordinates.split('_'))

    # Convert results
    d["results"] = [dict([[f[0].name, f[1]] for f in r.ListFields()]) for r in e.results._values]

    for ix, epoch in enumerate(d["results"]):
        epoch["num"] = ix + 1
        if "curve" in epoch:
            epoch["curve"] = [dict([[f[0].name, f[1]] for f in r.ListFields()]) for r in epoch["curve"]._values]
        if "matrix" in epoch:
            epoch["matrix"] = [r.columns._values for r in epoch["matrix"]]
        if "output" in epoch:
            epoch["output"] = dict(background=epoch["output"].background._values,
                                   signal=epoch["output"].signal._values)

    # Convert optimizer
    opt = e.WhichOneof("optimizers")
    d["optimizer"] = dict([[f[0].name, f[1]] for f in d[opt].ListFields()])
    d["optimizer"]["name"] = opt
    del d[opt]

    # Convert structure
    d["structure"] = [dict([[f[0].name, f[1]] for f in r.ListFields()]) for r in e.structure._values]
    for l in d["structure"]:
        if "type" in l:
            l["type"] = e.structure[0].Type.Name(l["type"])

    for ix, r in enumerate(d["results"]):
        r["current_time"] = sum([e["num_seconds"] for e in d["results"][:ix+1]])

    return d

if __name__ == "__main__":
    js = experiment_to_dict("ttHLep/U_1to1_l1")