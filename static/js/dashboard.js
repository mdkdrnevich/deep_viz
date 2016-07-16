/**
 * Created by Matt on 7/6/2016.
 */

var module = angular.module("main", []);

module.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);

module.controller("tableCtrl", function($scope, $http){
    $scope.py_datasets = py_datasets;
    $scope.datasets_keys = [];
    $scope.datasets_values = [];

    $scope.addDataset = function(name){
        // Add a dataset to the DOM
        var max_num = $scope.datasets_keys.reduce(function(prev, cur){
            Math.max(prev, cur);
        }, -1);
        var dataset_name = name.split('/')[0];
        var format_name = name.split('/')[1];
        $scope.datasets_values.push({id: "dataset-"+(max_num+1),
                                     dataset: name,
                                     x_value: '',
                                     y_value: '',
                                     color: "#2929d6",
                                     experiment: {results: [{}]}});
        $scope.datasets_keys.push(max_num+1);

        $http({url: "http://127.0.0.1:8080",
               method: "GET",
               params: {dataset: dataset_name, format: format_name}}).then(function(response){
            var this_ds = $scope.datasets_values[$scope.datasets_values.length-1];
            this_ds.y_value = "test_accuracy";
            this_ds.experiment = response.data;
            this_ds.exp_keys = Object.keys(response.data);

            get_scales(this_ds);
            add_axes(this_ds);
            add_points(this_ds);
        });
    };

    $scope.removeDataset = function($event) {
        // Remove a dataset from the DOM
        var loc = $scope.datasets_keys.indexOf(+$event.target.id.split('-')[1]);
        $scope.datasets_values.splice(loc, 1);
        $scope.datasets_keys.splice(loc, 1);
    };

    $scope.updatePlot = function(dataset) {
        get_scales(dataset);
        add_axes(dataset, true);
        add_points(dataset, true);
    };

    $scope.getKeys = function(obj) {
        return Object.keys(obj);
    };
});