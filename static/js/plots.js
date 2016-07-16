/**
 * Created by Matt on 7/3/2016.
 */

var settings = {
    h: 500,
    w: 800,
    padding: 60,
    svg: d3.select("#graphs").append("svg").attr("width", 800).attr("height", 500),
    scales: '',
    current_labels: {}
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

    settings.scales = [xScale, yScale];
    return datasets;
}

function add_axes(x_label, y_label) {

    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales[0];
    var yScale = settings.scales[1];

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
        .duration(3000)
        .attr("id", "x-label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", 30)
        .style("opacity", 1)
        .text(x_label);
    d3.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(3000)
        .attr("id", "y-label")
        .attr("x", -40)
        .attr("y", 10 + (h - 2 * padding) / 2)
        .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
        .style("opacity", 1)
        .text(y_label);

    settings.current_labels = {x: x_label, y: y_label};
    return null;
}

function update_axes(x_label, y_label) {

    var xScale = settings.scales[0];
    var yScale = settings.scales[1];

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    d3.select(".x.axis").transition().duration(3000).call(xAxis);
    d3.select(".y.axis").transition().duration(3000).call(yAxis);

    console.log(x_label, y_label);
    if (settings.current_labels.x != x_label) {
        d3.select("#x-label")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(x_label)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    }
    if (settings.current_labels.y != y_label) {
        d3.select("#y-label")
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .text(y_label)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    }
    settings.current_labels.x = x_label;
    settings.current_labels.y = y_label;
    return null;
}

function add_points(data) {

    var h = settings.h;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales[0];
    var yScale = settings.scales[1];

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
    var xScale = settings.scales[0];
    var yScale = settings.scales[1];

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