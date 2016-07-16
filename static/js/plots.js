/**
 * Created by Matt on 7/3/2016.
 */

var settings = {
    h: 500,
    w: 800,
    padding: 60,
    svg: d3.select("#graphs").append("svg").attr("width", 800).attr("height", 500),
    scales: {},
    current_labels: {x: '', y: '', top: '', right: ''}
};

function set_scales(datasets) {

    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;

    var x_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r[data.x_value];
        });
    });
    var x_min = d3.min(x_extents, function(d) {return d[0]});
    var x_max = d3.max(x_extents, function(d) {return d[1]});

    var y_extents = datasets.map( function (data) {
        return d3.extent(data.experiment.results, function(r) {
            return r[data.y_value];
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

    if (datasets[0].top_value) {
        var top_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                return r[data.top_value];
            });
        });
        var top_min = d3.min(top_extents, function(d) {return d[0]});
        var top_max = d3.max(top_extents, function(d) {return d[1]});

        settings.scales.top = d3.scale.linear()
                                    .domain([top_min, top_max])
                                    .range([padding, w - padding]);
    }
    if (datasets[0].right_value) {
        var right_extents = datasets.map( function (data) {
            return d3.extent(data.experiment.results, function(r) {
                return r[data.right_value];
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

function add_axes(axes) {

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
    d3.select(".x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("id", "x-label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", 30)
        .style("opacity", 1)
        .text(axes.x.value);
    d3.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("id", "y-label")
        .attr("x", -40)
        .attr("y", 10 + (h - 2 * padding) / 2)
        .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
        .style("opacity", 1)
        .text(axes.y.value);

    settings.current_labels = {x: axes.x.value, y: axes.y.value};

    if (axes.top.value) {
        add_top_axis(axes.top.value);
    }
    if (axes.right.value) {
        add_right_axis(axes.right.value);
    }
    return null;
}

function add_top_axis(label) {

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
    d3.select(".top.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("id", "top-label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", -30)
        .style("opacity", 1)
        .text(label);

    settings.current_labels.top = label;
    return null;
}

function add_right_axis(label) {

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
    d3.select(".right.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("id", "right-label")
        .attr("x", 40)
        .attr("y", padding + 35)
        .attr("transform", "rotate(90, 40," + (padding + 35) + ")")
        .style("opacity", 1)
        .text(label);

    settings.current_labels.right = label;
    return null;
}

function update_axes(axes) {

    var xScale = settings.scales.x;
    var yScale = settings.scales.y;

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    d3.select(".x.axis").transition().duration(3000).call(xAxis);
    d3.select(".y.axis").transition().duration(3000).call(yAxis);

    if (settings.current_labels.x != axes.x.value) {
        d3.select("#x-label")
            .transition()
            .duration(1500)
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
    }
    if (settings.current_labels.y != axes.y.value) {
        d3.select("#y-label")
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
            .style("opacity", 1);
        settings.current_labels.y = axes.y.value;
    }
    if ((settings.current_labels.top != axes.top.value) && axes.top.value) {
        if (!settings.current_labels.top) {
            add_top_axis(axes.top.value)
        } else {
            var topScale = settings.scales.top;
            var topAxis = d3.svg.axis().scale(topScale).orient("top").ticks(15);
            d3.select(".top.axis").transition().duration(3000).call(topAxis);
            d3.select("#top-label")
                .transition()
                .duration(1500)
                .style("opacity", 0)
                .transition()
                .duration(1500)
                .delay(1500)
                .text(axes.top.value)
                .transition()
                .duration(1500)
                .delay(1500)
                .style("opacity", 1);
        }
        settings.current_labels.top = axes.top.value;
    }
    if ((settings.current_labels.right != axes.right.value) && axes.right.value) {
        if (!settings.current_labels.right) {
            add_right_axis(axes.right.value)
        } else {
            var rightScale = settings.scales.right;
            var rightAxis = d3.svg.axis().scale(rightScale).orient("right").ticks(10);
            d3.select(".right.axis").transition().duration(3000).call(rightAxis);
            d3.select("#right-label")
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
        }
        settings.current_labels.right = axes.right.value;
    }
    return null;
}

function add_points(data) {

    var h = settings.h;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales.x;
    var yScale = settings.scales.y;

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
            return xScale(d[data.x_value])
        })
        .attr("cy", function (d) {
            return yScale(d[data.y_value])
        })
        .attr("r", 3)
        .attr("fill", data.color);
    return data;
}

function update_points(data) {

    var h = settings.h;
    var padding = settings.padding;
    var xScale = settings.scales.x;
    var yScale = settings.scales.y;

    var circles = d3.select("#points-"+data.id).selectAll("circle").data(data.experiment.results);
    circles.exit()
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    circles.transition()
        .duration(3000)
        .attr("cx", function (d) {
            return xScale(d[data.x_value])
        })
        .attr("cy", function (d) {
            return yScale(d[data.y_value])
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
            return xScale(d[data.x_value])
        })
        .attr("cy", function (d) {
            return yScale(d[data.y_value])
        })
        .attr("r", 3)
        .attr("fill", data.color);

    return data;
}

function remove_axes() {
    d3.selectAll(".axis")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    return null;
}

function remove_points(data) {
    d3.select("#points-"+data.id)
        .selectAll("circle")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    return data;
}