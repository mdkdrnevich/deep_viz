/**
 * Created by Matt on 7/3/2016.
 */

var div = $("div");
var plot = div.data("plot");

$.getJSON("http://127.0.0.1:8080", {dataset: "ttHLep", format: "U_1to1_l1_9j"}, function(dataset) {
    var scales = get_scales(dataset, plot);
    add_axes(scales, plot);
    add_points(dataset, scales, plot);
});

d3.selectAll(".update").on("click", function() {
    var inputs = $("p :text").toArray();
    inputs.forEach(function(x,ix,a) {a[ix] = x.value});
    var datafile, dataset, format;
    [plot, datafile] = inputs;
    [datadir, format] = datafile.split("/");
    $.getJSON("http://127.0.0.1:8080", {dataset: datadir, format: format}, function(dataset) {
        var scales = get_scales(dataset, plot);
        add_axes(scales, plot, true);
        add_points(dataset, scales, plot, true);
    });
});

var settings = {
    h: 500,
    w: 800,
    padding: 60,
    svg: d3.select("body").append("svg").attr("width", 800).attr("height", 500)
};

function get_scales(dataset, y_value) {

    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;

    var xScale = d3.scale.linear()
        .domain([0, dataset.total_time])
        .range([padding, w - padding]);
    var yScale = d3.scale.linear()
        .domain([d3.min(dataset.results, function (r) {
            return r[y_value];
        }),
            d3.max(dataset.results, function (r) {
                return r[y_value];
            })])
        .range([h - padding, padding]);

    return [xScale, yScale];
}

function add_axes(scales, y_value, transition) {

    var h = settings.h;
    var w = settings.w;
    var padding = settings.padding;
    var svg = settings.svg;

    var xScale = scales[0];
    var yScale = scales[1];

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
            .text(y_value);
    }
}

function add_points(dataset, scales, y_value, transition) {

    var w = settings.w;
    var h = settings.h;
    var padding = settings.padding;
    var svg = settings.svg;

    var xScale = scales[0];
    var yScale = scales[1];

    // Generate points on scatterplot
    if (transition) {
        var circles = d3.select("#points").selectAll("circle").data(dataset.results);
        circles.exit()
            .transition()
            .duration(1500)
            .style("opacity", 0)
            .remove();
        circles.transition()
            .duration(3000)
            .attr("cx", function (d) {
                return xScale(d.current_time)
            })
            .attr("cy", function (d) {
                return yScale(d[y_value])
            })
            .attr("r", 3)
            .attr("fill", "blue");
        circles.enter()
            .append("circle")
            .attr("cx", padding)
            .attr("cy", h - padding)
            .attr("r", 0)
            .transition()
            .delay(function(d, i){
                return i*800/dataset.results.length
            })
            .duration(3000)
            .attr("cx", function (d) {
                return xScale(d.current_time)
            })
            .attr("cy", function (d) {
                return yScale(d[y_value])
            })
            .attr("r", 3)
            .attr("fill", "blue");
    } else {

        svg.append("g")
            .attr("id", "points")
            .selectAll("circle")
            .data(dataset.results)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.current_time)
            })
            .attr("cy", function (d) {
                return yScale(d[y_value])
            })
            .attr("r", 2);
    }
}