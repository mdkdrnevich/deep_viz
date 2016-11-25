/**
 * Created by Matt on 7/22/2016.
 */



var hist = {};

hist.get_scales = function(dataset, axes, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    options = options ? options : {};

    var nbins = d3.max(dataset, function(d) {
        try {
            return d.experiment.results[0].output.background.length;
        } catch(err) {
            throw "Dataset '"+d.dataset+"' does not have attribute 'background'";
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
    
    var xScale = d3.scale.ordinal().domain(ticks).rangeRoundBands([margins.left, w - margins.right]);
    var yScale = d3.scale.linear().domain([0, fqMax]).range([h-margins.bottom, margins.top]);
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

hist.add_axes = function(scales, data, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    var xScale = scales.x;
    var yScale = scales.y;

    var tickVals = xScale.domain().filter(function (d, i) {
        return !((i * 4) % 10)
    });

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(tickVals);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

    this.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - margins.bottom + 5) + ")")
        .call(xAxis);
    this.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margins.left - 5) + ",0)")
        .call(yAxis);

    var xGrid = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-h + margins.top + margins.bottom - 10, 0, 0).tickFormat("");
    var yGrid = d3.svg.axis().scale(yScale).orient("left").tickSize(-w + margins.left + margins.right - 10, 0, 0).tickFormat("");
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

    if (options.grid)
        this.select(".y.grid").transition().duration(1500).style("opacity", 1);

    this.select(".x.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "x label")
        .attr("x", (w - margins.left - margins.right) / 2)
        .attr("y", 35)
        .style("opacity", 1)
        .text("Signal Prediction (%)");

    this.select(".y.axis").append("text")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("class", "y label")
        .attr("x", -45)
        .attr("y", 10 + (h - margins.top - margins.bottom) / 2)
        .attr("transform", "rotate(-90, -45," + (10 + (h - margins.bottom - margins.top) / 2) + ")")
        .style("opacity", 1)
        .text("Number of Events");
    return this;
};

hist.update_axes = function(scales, axes, options) {
    var w = get_container_width(this);
    var h = this.attr("height");
    var margins = settings.margins;
    var xScale = scales.x;
    var yScale = scales.y;
    var xLabel = this.select(".x.label");
    var yLabel = this.select(".y.label");

    var tickVals = xScale.domain().filter(function (d, i) {
        return !((i * 4) % 10)
    });

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues(tickVals);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
    this.select(".x.axis").transition().duration(3000).call(xAxis).select(".domain").style("opacity", 1);
    this.select(".y.axis").transition().duration(3000).call(yAxis).select(".domain").style("opacity", 1);

    this.selectAll(".axis .targets").transition().duration(1500).style("opacity", 0);
    this.selectAll(".legend").transition().duration(1500).style("opacity", 0);

    var yGrid = d3.svg.axis().scale(yScale).orient("left").tickSize(-w + margins.left + margins.right - 10, 0, 0).tickFormat("");

    if (options.grid) {
        this.select(".x.grid").transition().duration(3000).style("opacity", 0);
        this.select(".y.grid").transition().duration(3000).call(yGrid).style("opacity", 1);
    } else {
        this.selectAll(".grid")
        .transition()
        .duration(1500)
        .style("opacity", 0);
    }

    if (xLabel.text() != axes.x.value) {
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
            .text(axes.x.value)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    } else {
        this.select(".x.label")
            .transition()
            .duration(3000)
            .attr("x", (w - margins.right - margins.left) / 2)
            .attr("y", 35)
    }
    if (yLabel.text() != axes.y.value) {
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
            .text(axes.y.value)
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
    return this;
};

/*
This is where data is added
 */

hist.add_data = function(scales, data, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    var xScale = scales.x;
    var yScale = scales.y;
    var results = data.experiment.results;

    var bkgBars = this.append("g")
        .classed("data", true)
        .classed("plot"+data.id, true)
        .classed("bkg", true)
        .selectAll("rect")
        .data(results[0].output.background)
        .enter()
        .append("svg:rect")
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", h-margins.bottom)
        .attr("width", (w - margins.right - margins.left)/data.nbins)
        .attr("height", 0)
        .style("fill", "blue")
        .style("opacity", 0.5);

    var sigBars = this.append("g")
        .classed("data", true)
        .classed("plot"+data.id, true)
        .classed("sig", true)
        .selectAll("rect")
        .data(results[0].output.signal)
        .enter()
        .append("svg:rect")
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", h-margins.bottom)
        .attr("width", (w - margins.left - margins.right)/data.nbins)
        .attr("height", 0)
        .style("fill", "green")
        .style("opacity", 0.5);

    var timeScale = d3.scale.linear().domain([0, results.length]).range([0, 20000]); // How long for the hist animation
    var delta = timeScale(2)-timeScale(1);

    for (var i=0; i < results.length; i++) {
        bkgBars.data(results[i].output.background)
            .transition()
            .duration(delta)
            .delay(timeScale(i))
            .attr("x", function(d, i) {
                return xScale(i/data.nbins) + xScale.rangeBand()/2;
            })
            .attr("y", function(d) {
                return yScale(d);
            })
            .attr("width", (w - margins.left - margins.right)/data.nbins)
            .attr("height", function(d) {
                return h - margins.bottom - yScale(d);
            });
        sigBars.data(results[i].output.signal)
            .transition()
            .duration(delta)
            .delay(timeScale(i))
            .attr("x", function(d, i) {
                return xScale(i/data.nbins) + xScale.rangeBand()/2;
            })
            .attr("y", function(d) {
                return yScale(d);
            })
            .attr("width", (w - margins.left - margins.right)/data.nbins)
            .attr("height", function(d) {
                return h - margins.bottom - yScale(d);
            })
    }

    bkgBars.data(results[data.experiment.max_epoch - 1].output.background)
        .transition()
        .duration(1500)
        .delay(20000+delta)
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", function(d) {
            return yScale(d);
        })
        .attr("width", (w - margins.left - margins.right)/data.nbins)
        .attr("height", function(d) {
            return h - margins.bottom - yScale(d);
        });

    sigBars.data(results[data.experiment.max_epoch - 1].output.signal)
        .transition()
        .duration(1500)
        .delay(20000+delta)
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", function(d) {
            return yScale(d);
        })
        .attr("width", (w - margins.left - margins.right)/data.nbins)
        .attr("height", function(d) {
            return h - margins.bottom - yScale(d);
        });

    return this;
};

hist.update_data = function(scales, data, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    var xScale = scales[data.axes.x.scale];
    var yScale = scales[data.axes.y.scale];
    var results = data.experiment.results;

    this.selectAll(".data.plot"+data.id+".bkg rect")
        .data(results[data.experiment.max_epoch - 1].output.background)
        .transition()
        .duration(3000)
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", function(d) {
            return yScale(d);
        })
        .attr("width", (w - margins.left - margins.right)/data.nbins)
        .attr("height", function(d) {
            return h - margins.bottom - yScale(d);
        });

    this.selectAll(".data.plot"+data.id+".sig rect")
        .data(results[data.experiment.max_epoch - 1].output.signal)
        .transition()
        .duration(3000)
        .attr("x", function(d, i) {
            return xScale(i/data.nbins) + xScale.rangeBand()/2;
        })
        .attr("y", function(d) {
            return yScale(d);
        })
        .attr("width", (w - margins.left - margins.right)/data.nbins)
        .attr("height", function(d) {
            return h - margins.bottom - yScale(d);
        });

    /*this.selectAll(".data.plot"+data.id+" rect").select("title")
        .data(data.experiment.results)
        .text(function(d) {return '('+numFormat.format(d[data.axes.x.key])+', '+numFormat.format(d[data.axes.y.key])+')';});*/

    return this;
};