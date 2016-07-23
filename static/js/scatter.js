/**
 * Created by Matt on 7/3/2016.
 */

var scatter = {};

/*
This section gets scales for data
 */

scatter.get_scales = function(datasets, axes) {
    var h = this.attr("height");
    var w = get_container_width(this);
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
    
    var radius_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r.s_b;
        });
    });
    var r_min = d3.min(radius_extents, function(d) {return d[0]});
    var r_max = d3.max(radius_extents, function(d) {return d[1]});

    var xScale = d3.scale.linear()
        .domain([x_min, x_max])
        .range([padding, w - padding]);
    var yScale = d3.scale.linear()
        .domain([y_min, y_max])
        .range([h - padding, padding]);
    var rScale = d3.scale.linear()
        .domain([r_min, r_max])
        .range([1, 4]);

    var scales = {x: xScale, y: yScale, radius: rScale};

    if (axes.top.key && axes.top.value) {
        var top_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                return r[axes.top.key];
            });
        });
        var top_min = d3.min(top_extents, function(d) {return d[0]});
        var top_max = d3.max(top_extents, function(d) {return d[1]});

        scales.top = d3.scale.linear()
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

        scales.right = d3.scale.linear()
                                    .domain([right_min, right_max])
                                    .range([h - padding, padding]);
    }
    return scales;
};

/*
This section generates and updates axes
 */

scatter.add_axes = function(scales, axes) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var padding = settings.padding;
    var xScale = scales.x;
    var yScale = scales.y;

    // Generate Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    this.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - padding + 5) + ")")
        .call(xAxis);
    this.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (padding - 5) + ",0)")
        .call(yAxis);

    // Label the axes
    this.select(".x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "x label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", 30)
        .style("opacity", 1)
        .text(axes.x.value);
    this.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "y label")
        .attr("x", -40)
        .attr("y", 10 + (h - 2 * padding) / 2)
        .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
        .style("opacity", 1)
        .text(axes.y.value);

    if (axes.top.key && axes.top.value) {
        scatter.add_top_axis.call(this, scales.top, axes.top.value);
    }
    if (axes.right.key && axes.right.value) {
        scatter.add_right_axis.call(this, scales.right, axes.right.value);
    }
    return this;
};

scatter.add_top_axis = function(scale, label) {
    var w = get_container_width(this);
    var padding = settings.padding;

    // Generate Axis
    var axis = d3.svg.axis().scale(scale).orient("top").ticks(15);

    this.append("g")
        .attr("class", "top axis")
        .attr("transform", "translate(0," + (padding - 5) + ")")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    this.select(".top.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "top label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", -30)
        .style("opacity", 1)
        .text(label);
    return this;
};

scatter.add_right_axis = function(scale, label) {
    var w = get_container_width(this);
    var padding = settings.padding;

    // Generate Axis
    var axis = d3.svg.axis().scale(scale).orient("right").ticks(10);

    this.append("g")
        .attr("class", "right axis")
        .attr("transform", "translate(" + (w - padding + 5) + ",0)")
        .transition()
        .duration(3000)
        .call(axis);

    // Label the axes
    this.select(".right.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "right label")
        .attr("x", 40)
        .attr("y", padding + 35)
        .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
        .style("opacity", 1)
        .text(label);
    return this;
};

scatter.update_axes = function(scales, axes) {
    var w = get_container_width(this);
    var h = this.attr("height");
    var padding = settings.padding;
    var xScale = scales.x;
    var yScale = scales.y;
    var xLabel = this.select(".x.label");
    var yLabel = this.select(".y.label");
    var topLabel = this.select(".top.label");
    var rightLabel = this.select(".right.label");

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    this.select(".x.axis").transition().duration(3000).call(xAxis);
    this.select(".y.axis").transition().duration(3000).call(yAxis);

    if (xLabel.text() != axes.x.value) {
        this.select(".x.label")
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
    } else {
        this.select(".x.label")
            .transition()
            .duration(3000)
            .attr("x", (w - 2 * padding) / 2)
    }
    if (yLabel.text() != axes.y.value) {
        this.select(".y.label")
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
    } else {
        this.select(".y.label")
            .transition()
            .duration(3000)
            .attr("y", 10 + (h - 2 * padding) / 2)
            .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
    }

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
    } else if (!topLabel.empty() && (topLabel.text() == axes.top.value)) {
        topAxis = d3.svg.axis().scale(scales.top).orient("top").ticks(15);
        this.select(".top.axis").transition().duration(3000).call(topAxis);
        this.select(".top.label")
            .transition()
            .duration(3000)
            .attr("x", (w - 2 * padding) / 2)
    }

    if (rightLabel.empty() && axes.right.value) {
        scatter.add_right_axis.call(this, scales.right, axes.right.value)
    } else if (!rightLabel.empty() && !axes.right.value) {
        remove_axis.call(this, 'right');
    } else if (!rightLabel.empty() && (rightLabel.text() != axes.right.value)) {
        rightAxis = d3.svg.axis().scale(scales.right).orient("right").ticks(15);
        this.select(".right.axis").transition().duration(3000)
            .attr("transform", "translate(" + (w - padding + 5) + ",0)")
            .call(rightAxis);
        this.select(".right.label")
            .transition()
            .duration(1000)
            .attr("x", 40)
            .attr("y", padding + 35)
            .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
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
            .attr("transform", "translate(" + (w - padding + 5) + ",0)")
            .call(rightAxis);
        this.select(".right.label")
            .transition()
            .duration(3000)
            .attr("x", 40)
            .attr("y", padding + 35)
            .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
    }
    return this;
};

/*
This section creates and updates scatterplot points
 */

scatter.add_data = function(scales, data) {
    var h = this.attr("height");
    var padding = settings.padding;
    var xScale = scales[data.axes.x.scale];
    var yScale = scales[data.axes.y.scale];
    var rScale = scales.radius;

    // Generate points on scatterplot
    this.append("g")
        .attr("class", "points")
        .attr("id", "plot"+data.id)
        .selectAll("circle")
        .data(data.experiment.results)
        .enter()
        .append("svg:circle")
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
        .attr("r", function (d) {
            return rScale(d.s_b);
        })
        .attr("fill", data.color);
    this.selectAll(".points#plot"+data.id+" circle")
        .data(data.experiment.results)
        .append("svg:title")
        .text(function(d) {return '('+numFormat.format(d[data.axes.x.key])+', '+numFormat.format(d[data.axes.y.key])+')';});
    return this;
};

scatter.update_data = function(scales, data) {
    var h = this.attr("height");
    var padding = settings.padding;
    var xScale = scales[data.axes.x.scale];
    var yScale = scales[data.axes.y.scale];
    var rScale = scales.radius;

    var circles = this.selectAll(".points#plot"+data.id+" circle").data(data.experiment.results);
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
        .attr("r", function (d) {
            return rScale(d.s_b);
        })
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
        .attr("r", function (d) {
            return rScale(d.s_b);
        })
        .attr("fill", data.color);

    this.selectAll(".points#plot"+data.id+" circle").select("title")
        .data(data.experiment.results)
        .text(function(d) {return '('+numFormat.format(d[data.axes.x.key])+', '+numFormat.format(d[data.axes.y.key])+')';});

    return this;
};