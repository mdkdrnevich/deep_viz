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
    num: "Number of Epochs"
};

module.controller("tableCtrl", function($scope, $http){
    $scope.py_datasets = py_datasets;
    $scope.datasets_keys = [];
    $scope.datasets_values = [];
    $scope.x_axis = {key: 'current_time', value: readableNames['current_time']};
    $scope.y_axis = {key: 'test_accuracy', value: readableNames['test_accuracy']};
    $scope._first_plot = true;
    $scope.common_data = '';

    $scope.addDataset = function(name){
        // Add a dataset to the DOM
        var new_num = $scope._first_plot ? 0 : Math.max.apply(null, $scope.datasets_keys) + 1;
        var dataset_name = name.split('/')[0];
        var format_name = name.split('/')[1];
        $scope.datasets_values.push({id: "dataset-"+new_num,
                                     dataset: name,
                                     x_value: $scope.x_axis.key,
                                     y_value: $scope.y_axis.key,
                                     color: "#2929d6",
                                     experiment: {results: [{}]}});
        $scope.datasets_keys.push(new_num);

        $http({url: "http://127.0.0.1:8080",
               method: "GET",
               params: {dataset: dataset_name, format: format_name}}).then(function(response){
            var this_ds = $scope.datasets_values[$scope.datasets_values.length-1];
            this_ds.experiment = response.data;

            $scope.common_data = $scope.getCommonData();

            set_scales($scope.datasets_values);
            if ($scope._first_plot) {
                add_axes($scope.x_axis.value, $scope.y_axis.value);
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
            dataset.x_value = $scope.x_axis.key;
            dataset.y_value = $scope.y_axis.key;
        });
        set_scales($scope.datasets_values);
        update_axes($scope.x_axis.value, $scope.y_axis.value);
        $scope.datasets_values.forEach(function (dataset) {
            $scope.updatePlot(dataset);
        });
    };

    $scope.getKeys = function(obj) {
        return Object.keys(obj);
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