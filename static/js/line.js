/**
 * Created by Matt on 8/2/2016.
 */

// Should be very similar to scatter.js

var line = {};

/*
This section gets scales for data
 */

line.get_scales = function(datasets, axes) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;

    var x_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            if (r[data.axes[data.plot_type].x.key]) {
                return r[data.axes[data.plot_type].x.key];
            } else {
                throw "Dataset '"+data.dataset+"' does not have attribute '"+readableNames[data.axes[data.plot_type].x.key]+"'";
            }
        });
    });
    var x_min = d3.min(x_extents, function(d) {return d[0]});
    var x_max = d3.max(x_extents, function(d) {return d[1]});

    var y_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            if (r[data.axes[data.plot_type].y.key]) {
                return r[data.axes[data.plot_type].y.key];
            } else {
                throw "Dataset '"+data.dataset+"' does not have attribute '"+readableNames[data.axes[data.plot_type].y.key]+"'";
            }
        });
    });
    var y_min = d3.min(y_extents, function(d) {return d[0]});
    var y_max = d3.max(y_extents, function(d) {return d[1]});

    /*var radius_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r.s_b;
        });
    });
    var r_min = d3.min(radius_extents, function(d) {return d[0]});
    var r_max = d3.max(radius_extents, function(d) {return d[1]});*/

    var xScale = d3.scale.linear()
        .domain([x_min, x_max])
        .range([margins.left, w - margins.right]);
    var yScale = d3.scale.linear()
        .domain([y_min, y_max])
        .range([h - margins.bottom, margins.top]);
    /*
    var rScale = d3.scale.linear()
        .domain([r_min, r_max])
        .range([1, 4]);
    */

    var scales = {x: xScale, y: yScale};//, radius: rScale};

    /*
    if (axes.top.key && axes.top.value) {
        var top_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                if (r[axes.top.key]) {
                    return r[axes.top.key];
                } else {
                    throw "Dataset '"+data.dataset+"' does not have attribute '"+readableNames[axes.top.key]+"'";
                }
            });
        });
        var top_min = d3.min(top_extents, function(d) {return d[0]});
        var top_max = d3.max(top_extents, function(d) {return d[1]});

        scales.top = d3.scale.linear()
                                    .domain([top_min, top_max])
                                    .range([margins.left, w - margins.right]);
    }
    if (axes.right.key && axes.right.value) {
        var right_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                if (r[axes.right.key]) {
                    return r[axes.right.key];
                } else {
                    throw "Dataset '"+data.dataset+"' does not have attribute '"+readableNames[axes.right.key]+"'";
                }
            });
        });
        var right_min = d3.min(right_extents, function(d) {return d[0]});
        var right_max = d3.max(right_extents, function(d) {return d[1]});

        scales.right = d3.scale.linear()
                                    .domain([right_min, right_max])
                                    .range([h - margins.bottom, margins.top]);
    } */
    return scales;
};

/*
This section generates and updates axes
 */

line.add_axes = function(scales, axes, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    var xScale = scales.x;
    var yScale = scales.y;

    // Generate Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    this.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + (h - margins.bottom + 5) + ")")
        .call(xAxis);
    this.append("g")
        .classed("y axis", true)
        .attr("transform", "translate(" + (margins.left - 5) + ",0)")
        .call(yAxis);

    var xGrid = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-h + margins.top + margins.bottom - 10, 0, 0).tickFormat("");
    var yGrid = d3.svg.axis().scale(yScale).orient("left").tickSize(-w + margins.right + margins.left - 10, 0, 0).tickFormat("");
    this.append("g")
        .classed("x grid", true)
        .attr("transform", "translate(0," + (h - margins.bottom + 5) + ")")
        .call(xGrid)
        .style("opacity", 0);
    this.append("g")
        .classed("y grid", true)
        .attr("transform", "translate(" + (margins.left - 5) + ",0)")
        .call(yGrid)
        .style("opacity", 0);

    if (options.grid) {
        this.select(".x.grid").transition().duration(1500).style("opacity", 1);
        this.select(".y.grid").transition().duration(1500).style("opacity", 1);
    }

    // Label the axes
    this.select(".x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "x label")
        .attr("x", (w - margins.left - margins.right) / 2)
        .attr("y", 35)
        .style("opacity", 1)
        .text(axes.x);
    this.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "y label")
        .attr("x", -45)
        .attr("y", 10 + (h - margins.left - margins.right) / 2)
        .attr("transform", "rotate(-90, -45," + (10 + (h - margins.left - margins.right) / 2) + ")")
        .style("opacity", 1)
        .text(axes.y);

    /*
    if (axes.top.key && axes.top.value) {
        scatter.add_top_axis.call(this, scales.top, axes.top.value);
    }
    if (axes.right.key && axes.right.value) {
        scatter.add_right_axis.call(this, scales.right, axes.right.value);
    } */
    return this;
};

line.add_top_axis = function(scale, label) {
    var w = get_container_width(this);
    var margins = settings.margins;

    // Generate Axis
    var axis = d3.svg.axis().scale(scale).orient("top").ticks(15);

    this.append("g")
        .attr("class", "top axis")
        .attr("transform", "translate(0," + (margins.top - 5) + ")")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    this.select(".top.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "top label")
        .attr("x", (w - margins.left - margins.right) / 2)
        .attr("y", -35)
        .style("opacity", 1)
        .text(label);
    return this;
};

line.add_right_axis = function(scale, label) {
    var w = get_container_width(this);
    var margins = settings.margins;

    // Generate Axis
    var axis = d3.svg.axis().scale(scale).orient("right").ticks(10);

    this.append("g")
        .attr("class", "right axis")
        .attr("transform", "translate(" + (w - margins.right + 5) + ",0)")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    this.select(".right.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "right label")
        .attr("x", 45)
        .attr("y", margins.top + 35)
        .attr("transform", "rotate(90, 45," + (margins.top + 35) + ")")
        .style("opacity", 1)
        .text(label);
    return this;
};

line.update_axes = function(scales, axes, options) {
    var w = get_container_width(this);
    var h = this.attr("height");
    var margins = settings.margins;
    var xScale = scales.x;
    var yScale = scales.y;
    var xLabel = this.select(".x.label");
    var yLabel = this.select(".y.label");
    var topLabel = this.select(".top.label");
    var rightLabel = this.select(".right.label");

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    this.select(".x.axis").transition().duration(3000).call(xAxis).select(".domain").style("opacity", 1);
    this.select(".y.axis").transition().duration(3000).call(yAxis).select(".domain").style("opacity", 1);

    this.selectAll(".axis .targets").transition().duration(1500).style("opacity", 0);
    this.selectAll(".legend").transition().duration(1500).style("opacity", 0);

    var xGrid = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-h + margins.top + margins.bottom - 10, 0, 0).tickFormat("");
    var yGrid = d3.svg.axis().scale(yScale).orient("left").tickSize(-w + margins.left + margins.right - 10, 0, 0).tickFormat("");

    if (options.grid) {
        this.select(".x.grid").transition().duration(3000).call(xGrid).style("opacity", 1);
        this.select(".y.grid").transition().duration(3000).call(yGrid).style("opacity", 1);
    } else {
        this.selectAll(".grid")
        .transition()
        .duration(1500)
        .style("opacity", 0)
    }

    if (xLabel.text() != axes.x) {
        this.select(".x.label")
            .transition()
            .duration(1000)
            .attr("x", (w - margins.left - margins.right) / 2)
            .attr("y", 35)
            .transition()
            .duration(500)
            .delay(1000)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.x)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    } else {
        this.select(".x.label")
            .transition()
            .duration(3000)
            .attr("x", (w - margins.left - margins.right) / 2)
            .attr("y", 35)
    }
    if (yLabel.text() != axes.y) {
        this.select(".y.label")
            .transition()
            .duration(1000)
            .attr("x", -45)
            .attr("y", 10 + (h - margins.top - margins.bottom) / 2)
            .attr("transform", "rotate(-90, -45," + (10 + (h - margins.top - margins.bottom) / 2) + ")")
            .transition()
            .duration(500)
            .delay(1000)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.y)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    } else {
        this.select(".y.label")
            .transition()
            .duration(3000)
            .attr("x", -45)
            .attr("y", 10 + (h - margins.top - margins.bottom) / 2)
            .attr("transform", "rotate(-90, -45," + (10 + (h - margins.top - margins.bottom) / 2) + ")")
    }

    /*
    var topAxis, rightAxis;

    if (topLabel.empty() && axes.top.value) {
        scatter.add_top_axis.call(this, scales.top, axes.top.value)
    } else if (!topLabel.empty() && !axes.top.value) {
        remove_axis.call(this, 'top');
    } else if (!topLabel.empty() && (topLabel.text() != axes.top.value)) {
        topAxis = d3.svg.axis().scale(scales.top).orient("top").ticks(15);
        this.select(".top.axis").transition().duration(3000).call(topAxis);
        this.select(".top.label")
            .transition()
            .duration(1000)
            .attr("x", (w - margins.left - margins.right) / 2)
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
    } else if (!topLabel.empty() && (topLabel.text() == axes.top.value)) {
        topAxis = d3.svg.axis().scale(scales.top).orient("top").ticks(15);
        this.select(".top.axis").transition().duration(3000).call(topAxis);
        this.select(".top.label")
            .transition()
            .duration(3000)
            .attr("x", (w - margins.left - margins.right) / 2)
    }

    if (rightLabel.empty() && axes.right.value) {
        scatter.add_right_axis.call(this, scales.right, axes.right.value)
    } else if (!rightLabel.empty() && !axes.right.value) {
        remove_axis.call(this, 'right');
    } else if (!rightLabel.empty() && (rightLabel.text() != axes.right.value)) {
        rightAxis = d3.svg.axis().scale(scales.right).orient("right").ticks(15);
        this.select(".right.axis").transition().duration(3000)
            .attr("transform", "translate(" + (w - margins.right + 5) + ",0)")
            .call(rightAxis);
        this.select(".right.label")
            .transition()
            .duration(1000)
            .attr("x", 45)
            .attr("y", margins.top + 35)
            .attr("transform", "rotate(90, 40," + (margins.top + 35) + ")")
            .transition()
            .duration(500)
            .delay(1000)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(axes.right.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    } else if (!rightLabel.empty() && (rightLabel.text() == axes.right.value)) {
        rightAxis = d3.svg.axis().scale(scales.right).orient("right").ticks(15);
        this.select(".right.axis").transition().duration(3000)
            .attr("transform", "translate(" + (w - margins.right + 5) + ",0)")
            .call(rightAxis);
        this.select(".right.label")
            .transition()
            .duration(3000)
            .attr("x", 45)
            .attr("y", margins.top + 35)
            .attr("transform", "rotate(90, 40," + (margins.top + 35) + ")")
    } */
    return this;
};

line.add_data = function(scales, data, options) {
    var h = this.attr("height");
    var xScale = scales.x;
    var yScale = scales.y;

    var path = d3.svg.line()
        .x(function(d) {
            return xScale(d[data.axes[data.plot_type].x.key])
        })
        .y(function(d) {
            return yScale(d[data.axes[data.plot_type].y.key])
        });

    function getSmoothInterpolation(d) {
             var interpolate = d3.scale.linear()
                 .domain([0,1])
                 .range([1, d.length + 1]);

             return function(t) {
                 var flooredX = Math.floor(interpolate(t));
                 var weight = interpolate(t) - flooredX;
                 var interpolatedLine = d.slice(0, flooredX);

                 if(flooredX > 0 && flooredX < d.length) {
                     var dx = d[flooredX][data.axes[data.plot_type].x.key] - d[flooredX-1][data.axes[data.plot_type].x.key];
                     var dy = d[flooredX][data.axes[data.plot_type].y.key] - d[flooredX-1][data.axes[data.plot_type].y.key];
                     var ix = interpolatedLine.push({}) - 1;
                     interpolatedLine[ix][data.axes[data.plot_type].x.key] = d[flooredX-1][data.axes[data.plot_type].x.key] + (dx * weight);
                     interpolatedLine[ix][data.axes[data.plot_type].y.key] = d[flooredX-1][data.axes[data.plot_type].y.key] + (dy * weight);
                     }
                 return path(interpolatedLine);
                 }
         }

    this.append("path")
        .datum(data.experiment.results)
        .classed("data", true)
        .classed("plot"+data.id, true)
        .classed("line", true)
        .style("stroke", data.color)
        .transition()
        .duration(3000)
        .attrTween('d', getSmoothInterpolation);

    return this;
};

line.update_data = function(scales, data, options) {
    var h = this.attr("height");
    var xScale = scales.x;
    var yScale = scales.y;

    var new_path = d3.svg.line()
        .x(function(d) {
            return xScale(d[data.axes[data.plot_type].x.key])
        })
        .y(function(d) {
            return yScale(d[data.axes[data.plot_type].y.key])
        });

    var path = this.select(".data.plot"+data.id+".line").datum(data.experiment.results);
    path.transition()
        .duration(3000)
        .attr('d', new_path)
        .style("stroke", data.color);

    return this;
};