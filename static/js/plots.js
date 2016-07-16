/**
 * Created by Matt on 7/3/2016.
 */

var settings = {
    h: 500,
    w: 800,
    padding: 60,
    svg: d3.select("#graphs").append("svg").attr("width", 800).attr("height", 500)
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

function add_axes(data, transition) {

    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;
    var svg = settings.svg;
    var xScale = settings.scales[0];
    var yScale = settings.scales[1];

    // Generate Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(15);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    if (transition) {
        d3.select(".x.axis").transition().duration(3000).call(xAxis);
        d3.select(".y.axis").transition().duration(3000).call(yAxis);
    } else {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - padding + 5) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (padding - 5) + ",0)")
            .call(yAxis);
        // Label the axes
        d3.select(".x.axis").append("text").attr("x", (w - 2 * padding) / 2).attr("y", 30).text("Seconds");
        d3.select(".y.axis").append("text")
            .attr("x", -40)
            .attr("y", 10 + (h - 2 * padding) / 2)
            .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
            .text(data.y_value);
    }
    return data;
}

function update_axes(datas) {
    // Iterate over all of the datas and set the axes accordingly
}

function add_points(data) {

    var h = settings.h
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

function remove_points(data) {
    d3.select("#points-"+data.id)
        .selectAll("circle")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    return data;
}