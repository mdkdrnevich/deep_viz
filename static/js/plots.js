/**
 * Created by Matt on 7/3/2016.
 */

var max_width = +$("#graphs").css("width").slice(0,-2);
var max_height = 500;

var global_settings = [{
    h: max_height,
    w: max_width,
    padding: 60,
    svg_row: d3.select("#graphs").append("svg").attr("width", max_width).attr("height", max_height),
    svg: d3.select("#graphs svg").append("g").attr("id", "plot-0"),
    scales: {},
    current_labels: {x: '', y: '', top: '', right: ''}
}];

function set_scales(plot, datasets, axes) {
    var settings = global_settings[plot];
    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;

    var x_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r[axes.x.key];
        });
    });
    var x_min = d3.min(x_extents, function(d) {return d[0]});
    var x_max = d3.max(x_extents, function(d) {return d[1]});

    var y_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r[axes.y.key];
        });
    });
    var y_min = d3.min(y_extents, function(d) {return d[0]});
    var y_max = d3.max(y_extents, function(d) {return d[1]});

    var xScale = d3.scale.linear()
        .domain([x_min, x_max])
        .range([padding, w - padding]);
    var yScale = d3.scale.linear()
        .domain([y_min, y_max])
        .range([h - padding, padding]);

    settings.scales = {x: xScale, y: yScale};

    if (axes.top.key && axes.top.value) {
        var top_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                return r[axes.top.key];
            });
        });
        var top_min = d3.min(top_extents, function(d) {return d[0]});
        var top_max = d3.max(top_extents, function(d) {return d[1]});

        settings.scales.top = d3.scale.linear()
                                    .domain([top_min, top_max])
                                    .range([padding, w - padding]);
    }
    if (axes.right.key && axes.right.value) {
        var right_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                return r[axes.right.key];
            });
        });
        var right_min = d3.min(right_extents, function(d) {return d[0]});
        var right_max = d3.max(right_extents, function(d) {return d[1]});

        settings.scales.right = d3.scale.linear()
                                    .domain([right_min, right_max])
                                    .range([h - padding, padding]);
    }
    return datasets;
}

function add_axes(plot, axes) {
    var settings = global_settings[plot];
    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales.x;
    var yScale = settings.scales.y;

    // Generate Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - padding + 5) + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (padding - 5) + ",0)")
        .call(yAxis);

    // Label the axes
    d3.select("#plot-"+plot+" .x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "x label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", 30)
        .style("opacity", 1)
        .text(axes.x.value);
    d3.select("#plot-"+plot+" .y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "y label")
        .attr("x", -40)
        .attr("y", 10 + (h - 2 * padding) / 2)
        .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
        .style("opacity", 1)
        .text(axes.y.value);

    settings.current_labels = {x: axes.x.value, y: axes.y.value};

    if (axes.top.key && axes.top.value) {
        add_top_axis(plot, axes.top.value);
    }
    if (axes.top.key && axes.right.value) {
        add_right_axis(plot, axes.right.value);
    }
    return null;
}

function add_top_axis(plot, label) {
    var settings = global_settings[plot];
    var w = settings.w;
    var padding = settings.padding;
    var svg = settings.svg;
    var topScale = settings.scales.top;

    // Generate Axis
    var axis = d3.svg.axis().scale(topScale).orient("top").ticks(15);

    svg.append("g")
        .attr("class", "top axis")
        .attr("transform", "translate(0," + (padding - 5) + ")")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    d3.select("#plot-"+plot+" .top.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "top label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", -30)
        .style("opacity", 1)
        .text(label);

    settings.current_labels.top = label;
    return null;
}

function add_right_axis(plot, label) {
    var settings = global_settings[plot];
    var w = settings.w;
    var h = settings.h;
    var padding = settings.padding;
    var svg = settings.svg;
    var rightScale = settings.scales.right;

    // Generate Axis
    var axis = d3.svg.axis().scale(rightScale).orient("right").ticks(10);

    svg.append("g")
        .attr("class", "right axis")
        .attr("transform", "translate(" + (w - padding + 5) + ",0)")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    d3.select("#plot-"+plot+" .right.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "right label")
        .attr("x", 40)
        .attr("y", padding + 35)
        .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
        .style("opacity", 1)
        .text(label);

    settings.current_labels.right = label;
    return null;
}

function update_axes(plot, axes) {
    var settings = global_settings[plot];
    var w = settings.w;
    var h = settings.h;
    var padding = settings.padding;
    var xScale = settings.scales.x;
    var yScale = settings.scales.y;

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    d3.select("#plot-"+plot+" .x.axis").transition().duration(3000).call(xAxis);
    d3.select("#plot-"+plot+" .y.axis").transition().duration(3000).call(yAxis);

    if (settings.current_labels.x != axes.x.value) {
        d3.select("#plot-"+plot+" .x.label")
            .transition()
            .duration(1000)
            .attr("x", (w - 2 * padding) / 2)
            .transition()
            .duration(500)
            .delay(1000)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.x.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
        settings.current_labels.x = axes.x.value;
    } else {
        d3.select("#plot-"+plot+" .x.label")
            .transition()
            .duration(3000)
            .attr("x", (w - 2 * padding) / 2)
    }
    if (settings.current_labels.y != axes.y.value) {
        d3.select("#plot-"+plot+" .y.label")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.y.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1)
            .transition()
            .duration(3000)
            .attr("y", 10 + (h - 2 * padding) / 2)
            .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")");
        settings.current_labels.y = axes.y.value;
    } else {
        d3.select("#plot-"+plot+" .y.label")
            .transition()
            .duration(3000)
            .attr("y", 10 + (h - 2 * padding) / 2)
            .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
    }

    var topScale, topAxis, rightScale, rightAxis;

    if (!settings.current_labels.top && axes.top.value) {
        add_top_axis(plot, axes.top.value)
    } else if ((settings.current_labels.top != axes.top.value) && axes.top.value) {
        topScale = settings.scales.top;
        topAxis = d3.svg.axis().scale(topScale).orient("top").ticks(15);
        d3.select("#plot-"+plot+" .top.axis").transition().duration(3000).call(topAxis);
        d3.select("#plot-"+plot+" .top.label")
            .transition()
            .duration(1000)
            .attr("x", (w - 2 * padding) / 2)
            .transition()
            .duration(500)
            .delay(1000)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.top.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
        settings.current_labels.top = axes.top.value;
    } else if ((settings.current_labels.top == axes.top.value) && axes.top.value) {
        topScale = settings.scales.top;
        topAxis = d3.svg.axis().scale(topScale).orient("top").ticks(15);
        d3.select("#plot-"+plot+" .top.axis").transition().duration(3000).call(topAxis);
        d3.select("#plot-"+plot+" .top.label")
            .transition()
            .duration(3000)
            .attr("x", (w - 2 * padding) / 2)
    }

    if (!settings.current_labels.right && axes.right.value) {
        add_right_axis(plot, axes.right.value)
    } else if ((settings.current_labels.right != axes.right.value) && axes.right.value) {
        rightScale = settings.scales.right;
        rightAxis = d3.svg.axis().scale(rightScale).orient("right").ticks(10);
        d3.select("#plot-"+plot+" .right.axis").transition().duration(3000)
            .attr("transform", "translate(" + (w - padding + 5) + ",0)")
            .call(rightAxis);
        d3.select("#plot-"+plot+" .right.label")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.right.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
        settings.current_labels.right = axes.right.value;
    } else if ((settings.current_labels.right == axes.right.value) && axes.right.value) {
        rightScale = settings.scales.right;
        rightAxis = d3.svg.axis().scale(rightScale).orient("right").ticks(10);
        d3.select("#plot-"+plot+" .right.axis").transition().duration(3000)
            .attr("transform", "translate(" + (w - padding + 5) + ",0)")
            .call(rightAxis);
    }
    return null;
}

function add_points(plot, data) {
    var settings = global_settings[plot];
    var h = settings.h;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales[data.axes.x.scale];
    var yScale = settings.scales[data.axes.y.scale];

    // Generate points on scatterplot
    svg.append("g")
        .attr("id", "points-"+data.id)
        .selectAll("circle")
        .data(data.experiment.results)
        .enter()
        .append("circle")
        .attr("cx", padding)
        .attr("cy", h - padding)
        .attr("r", 0)
        .transition()
        .delay(function(d, i){
            return i*800/data.experiment.results.length
        })
        .duration(3000)
        .attr("cx", function (d) {
            return xScale(d[data.axes.x.key])
        })
        .attr("cy", function (d) {
            return yScale(d[data.axes.y.key])
        })
        .attr("r", 3)
        .attr("fill", data.color);
    return data;
}

function update_points(plot, data) {
    var settings = global_settings[plot];
    var h = settings.h;
    var padding = settings.padding;
    var xScale = settings.scales[data.axes.x.scale];
    var yScale = settings.scales[data.axes.y.scale];

    var circles = d3.select("#points-"+data.id).selectAll("circle").data(data.experiment.results);
    circles.exit()
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    circles.transition()
        .duration(3000)
        .attr("cx", function (d) {
            return xScale(d[data.axes.x.key])
        })
        .attr("cy", function (d) {
            return yScale(d[data.axes.y.key])
        })
        .attr("r", 3)
        .attr("fill", data.color);
    circles.enter()
        .append("circle")
        .attr("cx", padding)
        .attr("cy", h - padding)
        .attr("r", 0)
        .transition()
        .delay(function(d, i){
            return i*800/data.experiment.results.length
        })
        .duration(3000)
        .attr("cx", function (d) {
            return xScale(d[data.axes.x.key])
        })
        .attr("cy", function (d) {
            return yScale(d[data.axes.y.key])
        })
        .attr("r", 3)
        .attr("fill", data.color);

    return data;
}

function remove_axis(plot, which) {
    var settings = global_settings[plot];
    d3.select("#plot-"+plot+" ."+which+".axis")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    settings.current_labels.top = '';
    settings.scales.top = null;
    return null;
}

function remove_axes(plot) {
    d3.selectAll("#plot-"+plot+" .axis")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    return null;
}

function remove_points(plot, data) {
    d3.select("#points-"+data.id)
        .selectAll("circle")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    return data;
}