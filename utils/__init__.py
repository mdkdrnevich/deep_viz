from deep_learning.protobuf import load_experiment
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

    # Convert results
    d["results"] = [dict([[f[0].name, f[1]] for f in r.ListFields()]) for r in e.results._values]

    for ix, epoch in enumerate(d["results"]):
        epoch["num"] = ix + 1
        epoch["curve"] = [dict([[f[0].name, f[1]] for f in r.ListFields()]) for r in epoch["curve"]._values]
        epoch["matrix"] = [r.columns._values for r in epoch["matrix"]]

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