/**
 * Created by Matt on 7/6/2016.
 */

var module = angular.module("main", []);

module.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);

var readableNames = {
    auc: "Area Under the Curve",
    current_time: "Time Elapsed",
    num_seconds: "Time this Epoch",
    s_b: "Significance (S/sqrt(B))",
    test_accuracy: "Test Accuracy",
    test_loss: "Test Loss",
    train_accuracy: "Train Accuracy",
    train_loss: "Train Loss",
    num: "Number of Epochs",
    x: "X-Axis",
    y: "Y-Axis",
    top: "Top-Axis",
    right: "Right-Axis"
};

module.controller("tableCtrl", function($scope, $http){
    $scope.py_datasets = py_datasets;
    $scope.datasets_keys = [];
    $scope.datasets_values = [];
    $scope.axes = {x: {key: 'current_time', value: readableNames['current_time']},
                   y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                   top: {key: '', value: ''},
                   right: {key: '', value: ''}};
    $scope.valid_x_axes = [{key: 'x', value: 'X-Axis'}];
    $scope.valid_y_axes = [{key: 'y', value: 'Y-Axis'}];

    $scope._first_plot = true;
    $scope.common_data = '';

    $scope.addDataset = function(name){
        // Add a dataset to the DOM
        var new_num = $scope._first_plot ? 0 : Math.max.apply(null, $scope.datasets_keys) + 1;
        var dataset_name = name.split('/')[0];
        var format_name = name.split('/')[1];
        $scope.datasets_values.push({id: "dataset-"+new_num,
                                     dataset: name,
                                     axes: {
                                         x:{ key: $scope.axes.x.key,
                                             value: $scope.axes.x.value,
                                             scale: 'x'},
                                         y:{ key: $scope.axes.y.key,
                                             value: $scope.axes.y.value,
                                             scale: 'y'}
                                     },
                                     color: "#2929d6",
                                     experiment: {results: [{}]}});
        $scope.datasets_keys.push(new_num);

        $http({url: "http://127.0.0.1:5000/data",
               method: "GET",
               params: {dataset: dataset_name, format: format_name}}).then(function(response){
            var this_ds = $scope.datasets_values[$scope.datasets_values.length-1];
            this_ds.experiment = response.data;

            $scope.common_data = $scope.getCommonData();

            set_scales($scope.datasets_values, $scope.axes);
            if ($scope._first_plot) {
                add_axes($scope.axes);
                add_points(this_ds);
                $scope._first_plot = false;
            }
            else {
                add_points(this_ds);
                $scope.updatePlots();
            }

        });
    };

    $scope.removeDataset = function($event) {
        // Remove a dataset from the DOM
        var loc = $scope.datasets_keys.indexOf(+$event.target.id.split('-')[1]);
        remove_points($scope.datasets_values[loc]);

        $scope.datasets_values.splice(loc, 1);
        $scope.datasets_keys.splice(loc, 1);

        if ($scope.datasets_keys.length == 0) {
            remove_axes();
            $scope._first_plot = true;
        } else {
            $scope.updatePlots();
        }
    };

    $scope.updatePlot = function(dataset) {
        update_points(dataset);
    };

    $scope.updatePlots = function() {
        $scope.datasets_values.forEach(function (dataset) {
            var x_scale = dataset.axes.x.scale;
            var y_scale = dataset.axes.y.scale;
            dataset.axes.x.key = $scope.axes[x_scale].key;
            dataset.axes.x.value = $scope.axes[x_scale].value;
            dataset.axes.y.key = $scope.axes[y_scale].key;
            dataset.axes.y.value = $scope.axes[y_scale].value;
        });
        set_scales($scope.datasets_values, $scope.axes);
        update_axes($scope.axes);
        $scope.datasets_values.forEach(function (dataset) {
            $scope.updatePlot(dataset);
        });
        $scope.valid_x_axes = $scope.get_valid_axes('x');
        $scope.valid_y_axes = $scope.get_valid_axes('y');
    };

    $scope.getKeys = function(obj) {
        return Object.keys(obj);
    };

    $scope.get_valid_axes = function(which) {
        var rval = [];
        Object.keys($scope.axes).forEach( function(a) {
            $scope.axes[a].key && $scope.axes[a].value ? rval.push({key: a, value: readableNames[a]}) : null;
        });
        switch (which) {
            case 'x':
                rval = rval.filter(function(e) {
                    return (e.key.startsWith('x') || e.key.startsWith('top'));
                });
                break;
            case 'y':
                rval = rval.filter(function(e) {
                    return (e.key.startsWith('y') || e.key.startsWith('right'));
                });
                break;
            default:
                break;
        }
        return rval;
    };

    $scope.getCommonData = function() {
        var options = new Set();
        var rval = [];
        $scope.datasets_values.forEach(function(entry) {
            Object.keys(entry.experiment.results[0]).forEach(function(x) {
                readableNames[x] && !options.has(x) ? options.add(x) && rval.push({key: x, value: readableNames[x]}) : null;
            });
        });
        return rval;
    };
});