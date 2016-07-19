/**
 * Created by Matt on 7/3/2016.
 */

var max_width = +$("#graphs").css("width").slice(0,-2) - 80;
var max_height = 450;

var settings = {
    h: max_height,
    w: max_width,
    padding: 60
};

var numFormat = new Intl.NumberFormat("en-US", {maximumFractionDigits: 3});

function get_container_width(element) {
    var rval = 0;
    element.each(function() {
        rval = +d3.select(this.parentNode).style("width").slice(0,-2);
        rval -= +d3.select(this.parentNode).style("padding-right").slice(0,-2);
        rval -= +d3.select(this.parentNode).style("padding-left").slice(0,-2);
    });
    return rval;
}

function add_graph(element, num) {
    var svg = d3.select($(element).get(0)).append("svg").attr("id", "plot-"+num).attr("height", max_height);
    svg.attr("width", get_container_width(svg));
    return svg;
}

function get_scales(datasets, axes) {
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

    var xScale = d3.scale.linear()
        .domain([x_min, x_max])
        .range([padding, w - padding]);
    var yScale = d3.scale.linear()
        .domain([y_min, y_max])
        .range([h - padding, padding]);

    var scales = {x: xScale, y: yScale};

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
}

function add_axes(scales, axes) {
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
        add_top_axis.call(this, scales.top, axes.top.value);
    }
    if (axes.right.key && axes.right.value) {
        add_right_axis.call(this, scales.right, axes.right.value);
    }
    return this;
}

function add_top_axis(scale, label) {
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
}

function add_right_axis(scale, label) {
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
}

function update_axes(scales, axes) {
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
        add_top_axis.call(this, scales.top, axes.top.value)
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
        add_right_axis.call(this, scales.right, axes.right.value)
    } else if (!rightLabel.empty() && !axes.right.value) {
        remove_axis.call(this, 'right');
    } else if (!rightLabel.empty() && (rightLabel.text() != axes.right.value)) {
        rightAxis = d3.svg.axis().scale(scales.right).orient("right").ticks(15);
        this.select(".right.axis").transition().duration(3000).call(rightAxis);
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
        this.select(".right.axis").transition().duration(3000).call(rightAxis);
        this.select(".right.label")
            .transition()
            .duration(3000)
            .attr("x", 40)
            .attr("y", padding + 35)
            .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
    }
    return this;
}

function add_points(scales, data) {
    var h = this.attr("height");
    var padding = settings.padding;
    var xScale = scales[data.axes.x.scale];
    var yScale = scales[data.axes.y.scale];

    // Generate points on scatterplot
    this.append("g")
        .attr("class", "points")
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
        .attr("r", 3)
        .attr("fill", data.color);
    this.selectAll(".points circle")
        .data(data.experiment.results)
        .append("svg:title")
        .text(function(d) {return '('+numFormat.format(d[data.axes.x.key])+', '+numFormat.format(d[data.axes.y.key])+')';});
    return this;
}

function update_points(scales, data) {
    var h = this.attr("height");
    var padding = settings.padding;
    var xScale = scales[data.axes.x.scale];
    var yScale = scales[data.axes.y.scale];

    var circles = this.selectAll(".points circle").data(data.experiment.results);
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

    this.selectAll(".points circle").select("title")
        .data(data.experiment.results)
        .text(function(d) {return '('+numFormat.format(d[data.axes.x.key])+', '+numFormat.format(d[data.axes.y.key])+')';});

    return this;
}

function remove_axis(which) {
    this.select("."+which+".axis")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    return this;
}

function remove_axes() {
    this.selectAll(".axis")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    return this;
}

function remove_points() {
    this.selectAll(".points circle")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    return this;
}