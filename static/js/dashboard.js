/**
 * Created by Matt on 7/6/2016.
 */

var module = angular.module("main", ['frapontillo.bootstrap-switch']);

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

var libs = {
    scatter: scatter,
    hist: hist,
    line: line,
    matrix: matrix
};

function addPlot(scope) {
    var ix = scope.plots.push({}) - 1;
    scope.plots[ix].datasets_keys = [];
    scope.plots[ix].datasets_values = [];
    scope.plots[ix].axes = {};
    scope.plots[ix].axes.selected = {x: {key: 'current_time', value: readableNames['current_time']},
                                     y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                                     top: {key: '', value: ''},
                                     right: {key: '', value: ''}};
    scope.plots[ix].axes.scatter = {x: {key: 'current_time', value: readableNames['current_time']},
                                     y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                                     top: {key: '', value: ''},
                                     right: {key: '', value: ''}};
    scope.plots[ix].axes.hist = {x: {key: 'Signal Prediction', value: 'Signal Prediction (%)'},
                                  y: {key: 'Number of Events', value: 'Number of Events'},
                                  top: {key: '', value: ''},
                                  right: {key: '', value: ''}};
    scope.plots[ix].axes.line = {x: {key: 'current_time', value: readableNames['current_time']},
                                  y: {key: 'test_accuracy', value: readableNames['test_accuracy']},
                                  top: {key: '', value: ''},
                                  right: {key: '', value: ''}};
    scope.plots[ix].axes.matrix = {x: {key: 'Predicted', value: 'Predicted'},
                                   y: {key: 'Real', value: 'Real'},
                                   top: {key: '', value: ''},
                                   right: {key: '', value: ''}};
    scope.plots[ix].valid_x_axes = [{key: 'x', value: 'X-Axis'}];
    scope.plots[ix].valid_y_axes = [{key: 'y', value: 'Y-Axis'}];
    scope.plots[ix].plot_type = "scatter";
    scope.plots[ix]._first_plot = true;
    scope.plots[ix].common_data = '';
    var num = ix == 0 ? 0 : scope.plots[ix-1].num + 1;
    scope.plots[ix].num = num;
    scope.plots[ix].ix = ix;
    scope.plots[ix].name = 'Plot '+(num+1);
    scope.plots[ix].options = {grid: false};
    return scope;
}

module.controller("mainCtrl", function($scope, $http){
    $scope.py_datasets = py_datasets;
    $scope.plots = [];
    $scope.rows = [[0]];
    $scope.rows_keys = [0];
    addPlot($scope);

    $scope.addRow = function() {
        addPlot($scope);
        var row = $scope.rows.push([0]) - 1;
        $scope.rows_keys.push(row);
    };

    $scope.addColumn = function(row) {
        addPlot($scope);
        var col = $scope.rows[row].push(+$scope.rows[row].slice(-1)+1) - 1;
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
                                     compare: false,
                                     axes: {
                                         x:{ key: myScope.axes[myScope.plot_type].x.key,
                                             value: myScope.axes[myScope.plot_type].x.value,
                                             scale: 'x'},
                                         y:{ key: myScope.axes[myScope.plot_type].y.key,
                                             value: myScope.axes[myScope.plot_type].y.value,
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

            var svg = d3.select("svg#plot-"+plot);

            var lib = libs[myScope.plot_type];
            try {
                var scales = lib.get_scales.call(svg, myScope.datasets_values, myScope.axes[myScope.plot_type]);
            } catch(err) {
                console.log(err);
                alert(err);
                myScope.datasets_keys.pop();
                myScope.datasets_values.pop();
                return null;
            }
            if (myScope._first_plot) {
                lib.add_axes.call(svg, scales, myScope.axes[myScope.plot_type], myScope.options);
                lib.add_data.call(svg, scales, this_ds, myScope.options);
                myScope._first_plot = false;
            }
            else {
                lib.add_data.call(svg, scales, this_ds, myScope.options);
                $scope.updatePlots(plot, true);
                myScope.datasets_values.slice(0, -1).forEach(function (dataset) {
                    $scope.updatePlot(plot, dataset);
                });
            }
        });
    };

    // Removes a dataset from the plot and updates the plot
    $scope.removeDataset = function(plot, $event) {
        // Remove a dataset from the DOM
        var myScope = $scope.plots[plot];
        var svg = d3.select("svg#plot-"+plot);
        var loc = myScope.datasets_keys.indexOf(+$event.target.id.split('-')[2]);

        var data = myScope.datasets_values[loc];
        remove_data.call(svg, data);
        myScope.datasets_values.splice(loc, 1);
        myScope.datasets_keys.splice(loc, 1);

        if (myScope.datasets_keys.length == 0) {
            remove_axes.call(svg);
            myScope._first_plot = true;
        } else {
            $scope.updatePlots(plot);
        }
    };

    // Updates an individual plot
    $scope.updatePlot = function(plot, dataset) {
        var myScope = $scope.plots[plot];
        var lib = libs[myScope.plot_type];
        var svg = d3.select("svg#plot-"+plot);
        var scales = lib.get_scales.call(svg, myScope.datasets_values, myScope.axes[myScope.plot_type]);
        lib.update_data.call(svg, scales, dataset, myScope.options);
    };

    // Updates all of the plots
    $scope.updatePlots = function(plot, no_data) {
        var myScope = $scope.plots[plot];
        var lib = libs[myScope.plot_type];
        var svg = d3.select("svg#plot-"+plot);

        var bool_top = Boolean(myScope.axes.selected.top);
        var bool_right = Boolean(myScope.axes.selected.right);
        if (!bool_top)
            myScope.axes[myScope.plot_type].top = {key: '', value: ''};
        if (!bool_right)
            myScope.axes[myScope.plot_type].right = {key: '', value: ''};
        myScope.datasets_values.forEach(function (dataset) {
            if (!bool_top) dataset.axes.x.scale = 'x';
            if (!bool_right) dataset.axes.y.scale = 'y';
            var x_scale = dataset.axes.x.scale;
            var y_scale = dataset.axes.y.scale;
            myScope.axes[myScope.plot_type] = myScope.axes.selected;
            dataset.axes.x.key = myScope.axes[myScope.plot_type][x_scale].key;
            dataset.axes.x.value = myScope.axes[myScope.plot_type][x_scale].value;
            dataset.axes.y.key = myScope.axes[myScope.plot_type][y_scale].key;
            dataset.axes.y.value = myScope.axes[myScope.plot_type][y_scale].value;
        });
        try {
            var scales = lib.get_scales.call(svg, myScope.datasets_values, myScope.axes[myScope.plot_type]);
        } catch(err) {
            console.log(err);
            alert(err);
            return null;
        }
        lib.update_axes.call(svg, scales, myScope.axes[myScope.plot_type], myScope.options);

        if (!no_data) {
            myScope.datasets_values.forEach(function (dataset) {
                $scope.updatePlot(plot, dataset);
            });
        }
        myScope.valid_x_axes = $scope.getValidAxes(plot, 'x');
        myScope.valid_y_axes = $scope.getValidAxes(plot, 'y');
    };

    $scope.changePlots = function(plot) {
        var myScope = $scope.plots[plot];
        var lib = libs[myScope.plot_type];
        var svg = d3.select("svg#plot-"+plot);

        try {
            var scales = lib.get_scales.call(svg, myScope.datasets_values, myScope.axes[myScope.plot_type]);
        } catch(err) {
            console.log(err);
            alert(err);
            return null;
        }

        myScope.valid_x_axes = $scope.getValidAxes(plot, 'x');
        myScope.valid_y_axes = $scope.getValidAxes(plot, 'y');
        myScope.axes.selected = myScope.axes[myScope.plot_type];
        myScope.common_data = $scope.getCommonData(plot);

        $scope.updatePlots(plot, true);
        myScope.datasets_values.forEach(function (data) {
            remove_data.call(svg, data);
            lib.add_data.call(svg, scales, data, myScope.options);
        });
    };

    $scope.reloadData = function(plot) {
        var myScope = $scope.plots[plot];
        var svg = d3.select("svg#plot-"+plot);
        var lib = libs[myScope.plot_type];
        try {
            var scales = lib.get_scales.call(svg, myScope.datasets_values, myScope.axes[myScope.plot_type]);
        } catch(err) {
            console.log(err);
            alert(err);
            return null;
        }
        svg.selectAll(".data")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .remove();
        myScope.datasets_values.forEach(function(d) {
           lib.add_data.call(svg, scales, d, myScope.options); 
        });
    };

    $scope.savePlot = function(plot) {
        var myScope = $scope.plots[plot];
        var source = crowbar.getSource(document.getElementById("plot-"+myScope.num)).source;
        var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        var url = window.URL.createObjectURL(blob);
        canvg('hiddenCanvas', url);
        var link = document.getElementById("hiddenLink");
        link.href = document.getElementById("hiddenCanvas").toDataURL("image/png");
        link.download = myScope.name+".png";
        link.click();
    };

    $scope.getKeys = function(obj) {
        return Object.keys(obj);
    };

    // Returns {key: "<axis key>", value: "<axis name>"} that have been generated
    $scope.getValidAxes = function(plot, which) {
        var myScope = $scope.plots[plot];
        var rval = [];
        Object.keys(myScope.axes[myScope.plot_type]).forEach( function(a) {
            myScope.axes[myScope.plot_type][a].key && myScope.axes[myScope.plot_type][a].value ? rval.push({key: a, value: readableNames[a]}) : null;
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
        switch(which) {
            case 'top':
                myScope.axes[myScope.plot_type].top = {key: '', value: ''};
                break;
            case 'right':
                myScope.axes[myScope.plot_type].right = {key: '', value: ''};
                break;
            default:
                break;
        }
    };

    // Returns a list of data that is common to all of the datasets
    $scope.getCommonData = function(plot) {
        var myScope = $scope.plots[plot];
        var options = new Set();
        if ((myScope.plot_type == "scatter") || (myScope.plot_type == "line")){
            var rval = [];
            myScope.datasets_values.forEach(function (entry) {
                Object.keys(entry.experiment.results[0]).forEach(function (x) {
                    readableNames[x] && !options.has(x) ? options.add(x) && rval.push({
                        key: x,
                        value: readableNames[x]
                    }) : null;
                });
            });
            return rval;
        } else if (myScope.plot_type == "hist") {
            return [];//[{key: '', value: ''}];
        } else {
            return [];
        }
    };

    $scope.validateCompare = function(plot) {
        var myScope = $scope.plots[plot];

        return !(myScope.datasets_values.filter(function(e) {
            if (e.compare) return true;
            }).length == 2);
    };
    
    $scope.checkCompare = function(plot, dataset) {
        var myScope = $scope.plots[plot];

        if (myScope.datasets_values.filter(function(e) {
            if (e.compare) return true;
            }).length > 2) {
                dataset.compare = false;
                alert("You may only select two datasets to compare.");
        }
    };
})
    .directive("graphSvg", function($timeout) {
        return {
            link: function(scope, element, attrs) {
                var func = function() {
                    var num = scope.plots[scope.plots.length-1].num;
                    add_graph(element, num);
                    if (+attrs.graphSvg > 0)
                        for (var i=0; i < scope.plots.length - 1; i++) {
                            scope.updatePlots(i);
                        }
                };
                $timeout(func, 0);
            }
        };
    });