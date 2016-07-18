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
    current_time: "Time Elapsed (s)",
    num_seconds: "Time this Epoch (s)",
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

module.controller("mainCtrl", function($scope, $http){
    $scope.py_datasets = py_datasets;
    $scope.plots = [{}];
    $scope.plots[0].datasets_keys = [];
    $scope.plots[0].datasets_values = [];
    $scope.plots[0].axes = {x: {key: 'current_time', value: readableNames['current_time']},
                   y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                   top: {key: '', value: ''},
                   right: {key: '', value: ''}};
    $scope.plots[0].valid_x_axes = [{key: 'x', value: 'X-Axis'}];
    $scope.plots[0].valid_y_axes = [{key: 'y', value: 'Y-Axis'}];

    $scope.plots[0]._first_plot = true;
    $scope.plots[0].common_data = '';
    $scope.plots[0].num = 0;

    $scope.addPlot = function() {
        var ix = $scope.plots.push({}) - 1;
        $scope.plots[ix].datasets_keys = [];
        $scope.plots[ix].datasets_values = [];
        $scope.plots[ix].axes = {x: {key: 'current_time', value: readableNames['current_time']},
                       y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                       top: {key: '', value: ''},
                       right: {key: '', value: ''}};
        $scope.plots[ix].valid_x_axes = [{key: 'x', value: 'X-Axis'}];
        $scope.plots[ix].valid_y_axes = [{key: 'y', value: 'Y-Axis'}];

        $scope.plots[ix]._first_plot = true;
        $scope.plots[ix].common_data = '';
        $scope.plots[ix].num = $scope.plots[ix-1].num + 1;
        add_graph($scope.plots[ix].num);
        for (var i=0; i < $scope.plots.length; i++) {
            $scope.updatePlots(i);
        }
    };

    $scope.smoothScroll = function($event) {
        $event.preventDefault();
        var position = $event.target.hash ? $($event.target.hash).offset().top-$(".navbar").height()-10 : 0;
        $('html, body').animate({
           scrollTop: position
        }, 1000, function(){
           window.location.hash = $event.target.hash;
        });
    };

    // Adds a dataset to a plot and updates the plot
    $scope.addDataset = function(plot, name){
        // Add a dataset to the DOM
        var myScope = $scope.plots[plot];
        var new_num = myScope._first_plot ? 0 : Math.max.apply(null, myScope.datasets_keys) + 1;
        var dataset_name = name.split('/')[0];
        var format_name = name.split('/')[1];
        myScope.datasets_values.push({id: ''+plot+"-dataset-"+new_num,
                                     dataset: name,
                                     axes: {
                                         x:{ key: myScope.axes.x.key,
                                             value: myScope.axes.x.value,
                                             scale: 'x'},
                                         y:{ key: myScope.axes.y.key,
                                             value: myScope.axes.y.value,
                                             scale: 'y'}
                                     },
                                     color: "#2929d6",
                                     experiment: {results: [{}]}});
        myScope.datasets_keys.push(new_num);

        $http({url: "http://127.0.0.1:5000/data",
               method: "GET",
               params: {dataset: dataset_name, format: format_name}}).then(function(response){
            var this_ds = myScope.datasets_values[myScope.datasets_values.length-1];
            this_ds.experiment = response.data;

            myScope.common_data = $scope.getCommonData(plot);

            set_scales(plot, myScope.datasets_values, myScope.axes);
            if (myScope._first_plot) {
                add_axes(plot, myScope.axes);
                add_points(plot, this_ds);
                myScope._first_plot = false;
            }
            else {
                add_points(plot, this_ds);
                $scope.updatePlots(plot);
            }

        });
    };

    // Removes a dataset from the plot and updates the plot
    $scope.removeDataset = function(plot, $event) {
        // Remove a dataset from the DOM
        var myScope = $scope.plots[plot];
        var loc = myScope.datasets_keys.indexOf(+$event.target.id.split('-')[2]);
        remove_points(plot, myScope.datasets_values[loc]);

        myScope.datasets_values.splice(loc, 1);
        myScope.datasets_keys.splice(loc, 1);

        if (myScope.datasets_keys.length == 0) {
            remove_axes(plot);
            myScope._first_plot = true;
        } else {
            $scope.updatePlots(plot);
        }
    };

    // Updates an individual plot
    $scope.updatePlot = function(plot, dataset) {
        update_points(plot, dataset);
    };

    // Updates all of the plots
    $scope.updatePlots = function(plot) {
        var myScope = $scope.plots[plot];
        var bool_top = Boolean(myScope.axes.top);
        var bool_right = Boolean(myScope.axes.right);
        if (!bool_top) {
            myScope.axes.top = {key: '', value: ''};
            remove_axis(plot, 'top');
        }
        if (!bool_right) {
            myScope.axes.right = {key: '', value: ''};
            remove_axis(plot, 'right');
        }
        myScope.datasets_values.forEach(function (dataset) {
            if (!bool_top) dataset.axes.x.scale = 'x';
            if (!bool_right) dataset.axes.y.scale = 'y';
            var x_scale = dataset.axes.x.scale;
            var y_scale = dataset.axes.y.scale;
            dataset.axes.x.key = myScope.axes[x_scale].key;
            dataset.axes.x.value = myScope.axes[x_scale].value;
            dataset.axes.y.key = myScope.axes[y_scale].key;
            dataset.axes.y.value = myScope.axes[y_scale].value;
        });
        set_scales(plot, myScope.datasets_values, myScope.axes);
        update_axes(plot, myScope.axes);
        myScope.datasets_values.forEach(function (dataset) {
            $scope.updatePlot(plot, dataset);
        });
        myScope.valid_x_axes = $scope.getValidAxes(plot, 'x');
        myScope.valid_y_axes = $scope.getValidAxes(plot, 'y');
    };

    $scope.getKeys = function(obj) {
        return Object.keys(obj);
    };

    // Returns {key: "<axis key>", value: "<axis name>"} that have been generated
    $scope.getValidAxes = function(plot, which) {
        var myScope = $scope.plots[plot];
        var rval = [];
        Object.keys(myScope.axes).forEach( function(a) {
            myScope.axes[a].key && myScope.axes[a].value ? rval.push({key: a, value: readableNames[a]}) : null;
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

    // Removes an optional axis
    $scope.removeAxis = function(plot, which) {
        var myScope = $scope.plots[plot];
        console.log("Click");
        switch(which) {
            case 'top':
                myScope.axes.top = {key: '', value: ''};
                break;
            case 'right':
                myScope.axes.right = {key: '', value: ''};
                break;
            default:
                break;
        }
    };

    // Returns a list of data that is common to all of the datasets
    $scope.getCommonData = function(plot) {
        var myScope = $scope.plots[plot];
        var options = new Set();
        var rval = [];
        myScope.datasets_values.forEach(function(entry) {
            Object.keys(entry.experiment.results[0]).forEach(function(x) {
                readableNames[x] && !options.has(x) ? options.add(x) && rval.push({key: x, value: readableNames[x]}) : null;
            });
        });
        return rval;
    };
});