/**
 * Created by Matt on 7/22/2016.
 */

var hist = {};

hist.get_scales = function(dataset, axes) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var padding = settings.padding;

    var nbins = d3.max(dataset, function(d) {
        try {
            return d.experiment.results[0].output.background.length;
        } catch(err) {
            return 0;
        }
    });
    dataset.forEach(function(e) {
        e.nbins = nbins;
    });

    // Scales
    var fqMax = d3.max(dataset, function(data) {
        return d3.max(data.experiment.results, function(d) {
            return Math.max(d3.max(d.output.background), d3.max(d.output.signal));
        });
    });


    var ticks = [];
    var i;
    for (i=0; i <= nbins; i++) {
        ticks.push(i/nbins);
    }

    var xScale = d3.scale.ordinal().domain(ticks).rangeRoundBands([padding, w - padding]);
    var yScale = d3.scale.linear().domain([0, fqMax]).range([h-padding, padding]);
    return {x: xScale, y: yScale};
};

/*
This section creates and updates bar charts (histograms)
 */

/*
data.experiment.output = {
    background : []
    signal: []
    every_epoch = False/True
}
 */

hist.add_axes = function(scales, data) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var padding = settings.padding;
    var xScale = scales.x;
    var yScale = scales.y;

    var tickVals = xScale.domain().filter(function (d, i) {
        return !((i * 4) % 10)
    });

    var shift_locs = function (axis) {
        axis.selectAll(".tick text").attr("transform", "translate(-" + xScale.rangeBand() + ",0)");
        axis.selectAll(".tick line").attr("transform", "translate(-" + xScale.rangeBand() + ",0)");
    };

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(tickVals);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    this.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - padding + 5) + ")")
        .call(xAxis);//.call(shift_locs);
    this.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (padding - 5) + ",0)")
        .call(yAxis);

    this.select(".x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "x label")
        .attr("x", (w - 2 * padding) / 2)
        .attr("y", 30)
        .style("opacity", 1)
        .text("Signal Prediction (%)");

    this.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "y label")
        .attr("x", -40)
        .attr("y", 10 + (h - 2 * padding) / 2)
        .attr("transform", "rotate(-90, -40," + (10 + (h - 2 * padding) / 2) + ")")
        .style("opacity", 1)
        .text("Number of Events");

    return this;
};

hist.add_data = function(scales, data) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var padding = settings.padding;
    var xScale = scales.x;
    var yScale = scales.y;
    var results = data.experiment.results;

    var bkgBars = this.append("g")
        .classed("bars", true)
        .classed("bkg", true)
        .selectAll("rect")
        .data(results[0].output.background)
        .enter()
        .append("svg:rect")
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", h-padding)
        .attr("width", (w - 2*padding)/data.nbins)
        .attr("height", 0)
        .style("fill", "blue")
        .style("opacity", 0.5);

    var sigBars = this.append("g")
        .classed("bars", true)
        .classed("sig", true)
        .selectAll("rect")
        .data(results[0].output.signal)
        .enter()
        .append("svg:rect")
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", h-padding)
        .attr("width", (w - 2*padding)/data.nbins)
        .attr("height", 0)
        .style("fill", "green")
        .style("opacity", 0.5);

    for (i=0; i < results.length; i++) {
        bkgBars.data(results[i].output.background)
            .transition()
            .duration(1500)
            .delay(i*1500)
            .attr("x", function(d, i) {
                return xScale(i/data.nbins) + xScale.rangeBand()/2;
            })
            .attr("y", function(d) {
                return yScale(d);
            })
            .attr("width", (w - 2*padding)/data.nbins)
            .attr("height", function(d) {
                return h - padding - yScale(d);
            });
        sigBars.data(results[i].output.signal)
            .transition()
            .duration(1500)
            .delay(i*1500)
            .attr("x", function(d, i) {
                return xScale(i/data.nbins) + xScale.rangeBand()/2;
            })
            .attr("y", function(d) {
                return yScale(d);
            })
            .attr("width", (w - 2*padding)/data.nbins)
            .attr("height", function(d) {
                return h - padding - yScale(d);
            })
    }
    return this;
};