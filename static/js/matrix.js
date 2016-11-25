/**
 * Created by Matt on 8/3/2016.
 */

// Can only be used on one dataset at a time

var matrix = {};

matrix.get_scales = function(datasets, axes) {
    var dataset = datasets[0];
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;

    if (!datasets)
        throw "No datasets have been added";

    var scales = {};
    if (dataset.experiment.results[0].matrix)
        var ndim = dataset.experiment.results[0].matrix.length;
    else
        throw "Dataset '"+dataset.dataset+"' does not have attribute 'matrix'";

    scales.color = d3.scale.linear()
        .domain([0, 1])
        .range(["#0000FF", "#FF0000"]);

    var sizes = [(w-margins.right-margins.left), (h-margins.bottom-margins.top)];
    var begins = [margins.left, margins.top];
    var ends = [w - margins.right, h - margins.bottom];
    var short = d3.min([(w-margins.right-margins.left), (h-margins.bottom-margins.top)]);
    var ix = sizes.findIndex(function(e) {
        return (e == short)
    });


    scales.side = d3.scale.linear()
        .domain([0, ndim])
        .range([begins[ix], ends[ix]]);

    return scales;
};

matrix.add_axes = function(scales, axes, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var margins = settings.margins;
    var colorScale = scales.color;
    var sideScale = scales.side;
    var ndim = sideScale.domain().slice(-1);

    var ds = (sideScale(1) - sideScale(0)) / 2;

    var offset = d3.sum(sideScale.range());
    var axisShift = (offset - margins.bottom + 5);

    // Build and hide grids
    var xGrid = d3.svg.axis().scale(sideScale).orient("bottom").tickSize(-h + margins.bottom + margins.top - 10, 0, 0)
        .tickFormat("");
    var yGrid = d3.svg.axis().scale(sideScale).orient("left").tickSize(-w + margins.right + margins.left - 10, 0, 0)
        .tickFormat("");
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

    // Label the squares
    this.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0,"+(h - margins.bottom + 5)+")")
            .append("g")
            .classed("targets", true)
            .selectAll("text")
            .data(d3.range(ndim))
            .enter()
            .append("text")
            .attr("x", function(d) {
                return sideScale(d) + ds;
            })
            .attr("y", margins.top - 5 - axisShift)
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .text(function(d) {return d})
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);

    this.append("g")
        .classed("y axis", true)
        .attr("transform", "translate("+(margins.left - 5)+",0)")
            .append("g")
            .classed("targets", true)
            .selectAll("text")
            .data(d3.range(ndim))
            .enter()
            .append("text")
            .attr("x", -5)
            .attr("y", function(d) {
                return sideScale(d) + ds;
            })
            .attr("text-anchor", "end")
            .style("font-size", "15px")
            .text(function(d) {return d})
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);

    // Label the axes
    this.select(".x.axis")
        .append("text")
        .attr("class", "x label")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("x", offset / 2)
        .attr("y", margins.top -30 - axisShift)
        .attr("text-anchor", "middle")
        .style("opacity", 1)
        .text(axes.x);
    this.select(".y.axis")
        .append("text")
        .attr("class", "y label")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .attr("x", -40)
        .attr("y", offset / 2)
        .attr("transform", "rotate(-90, -40," + (offset / 2) + ")")
        .attr("text-anchor", "middle")
        .style("opacity", 1)
        .text(axes.y);

    // Build a legend
    var length = (offset - margins.top - margins.bottom) / 10;

    function unfold(d) {
        return function(t) {
            if (t >= d/10) {
                return margins.top + d*length;
            } else {
                return margins.top + t*9*length;
            }
        }
    }

    var legendShift = margins.right / 3;

    this.append("g")
        .classed("legend", true)
        .selectAll("rect")
        .data(d3.range(10))
        .enter()
        .append("rect")
        .attr("x", offset - margins.right + legendShift)
        .attr("width", legendShift)
        .attr("height", length)
        .style("fill", function(d) {
            return colorScale(d/10);
        })
        .style("opacity", 1)
        .transition()
        .duration(1500)
        .attrTween("y", unfold);

    this.select(".legend")
        .selectAll("text")
        .data(d3.range(10))
        .enter()
        .append("text")
        .style("opacity", 0)
        .attr("x", offset - margins.right + 2*legendShift + 5)
        .attr("y", function(d) {
            return margins.top + d*length + length/2;
        })
        .attr("alignment-baseline", "middle")
        .text(function(d) {return "≥ 0."+d})
        .transition()
        .duration(150)
        .delay(function(d) {
            return d*150;
        })
        .style("opacity", 1);

    return this;
};

matrix.update_axes = function(scales, axes, options) {
    var w = get_container_width(this);
    var h = this.attr("height");
    var margins = settings.margins;
    var colorScale = scales.color;
    var sideScale = scales.side;
    var ndim = sideScale.domain().slice(-1);
    var xLabel = this.select(".x.label");
    var yLabel = this.select(".y.label");

    var ds = (sideScale(1) - sideScale(0)) / 2;
    var offset = d3.sum(sideScale.range());
    var axisShift = (offset - margins.bottom + 5);

    this.selectAll(".axis .tick").transition().duration(1500).style("opacity", 0);
    this.selectAll(".axis .domain").transition().duration(1500).style("opacity", 0);

    this.selectAll(".grid")
        .transition()
        .duration(1500)
        .style("opacity", 0);

    var targets = this.selectAll(".targets");

    // These are the class labels
    if (targets.empty()) {
        this.select(".x.axis")
            .append("g")
            .classed("targets", true)
            .selectAll("text")
            .data(d3.range(ndim))
            .enter()
            .append("text")
            .attr("x", function(d) {
                return sideScale(d) + ds;
            })
            .attr("y", margins.top - 5 - axisShift)
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .text(function(d) {return d})
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
        this.select(".y.axis")
            .append("g")
            .classed("targets", true)
            .selectAll("text")
            .data(d3.range(ndim))
            .enter()
            .append("text")
            .attr("x", -5)
            .attr("y", function(d) {
                return sideScale(d) + ds;
            })
            .attr("text-anchor", "end")
            .style("font-size", "15px")
            .text(function(d) {return d})
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .delay(1500)
            .style("opacity", 1);
    } else {
        targets.transition().duration(1500).delay(1500).style("opacity", 1);
    }

    if (xLabel.text() != axes.x) {
        this.select(".x.label")
            .transition()
            .duration(1000)
            .attr("x", offset / 2)
            .attr("y", margins.top -30 - axisShift)
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
            .attr("x", offset / 2)
            .attr("y", margins.top -30 - axisShift)
    }
    if (yLabel.text() != axes.y) {
        this.select(".y.label")
            .transition()
            .duration(1000)
            .attr("x", -40)
            .attr("y", offset / 2)
            .attr("transform", "rotate(-90, -40," + (offset / 2) + ")")
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
            .attr("x", -40)
            .attr("y", offset / 2)
            .attr("transform", "rotate(-90, -40," + (offset / 2) + ")")
    }

    var length = (offset - margins.top - margins.bottom) / 10;
     var legendShift = margins.right / 3;

    // Build a legend
    if (this.select(".legend").empty() || this.select(".legend").style("opacity") != 1) {
        if (!this.select(".legend").empty())
            this.select(".legend").remove();

        function unfold(d) {
            return function (t) {
                if (t >= d / 10) {
                    return margins.top + d * length;
                } else {
                    return margins.top + t * 9 * length;
                }
            }
        }

        this.append("g")
            .classed("legend", true)
            .selectAll("rect")
            .data(d3.range(10))
            .enter()
            .append("rect")
            .attr("x", offset - margins.right + legendShift)
            .attr("y", margins.top)
            .attr("width", legendShift)
            .attr("height", length)
            .style("fill", function (d) {
                return colorScale(d / 10);
            })
            .style("opacity", 0)
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .transition()
            .duration(1500)
            .delay(1500)
            .attrTween("y", unfold);

        this.select(".legend")
            .selectAll("text")
            .data(d3.range(10))
            .enter()
            .append("text")
            .style("opacity", 0)
            .attr("x", offset - margins.right + 2*legendShift + 5)
            .attr("y", function (d) {
                return margins.top + d * length + length / 2;
            })
            .attr("alignment-baseline", "middle")
            .text(function (d) {
                return "≥ 0." + d
            })
            .transition()
            .duration(150)
            .delay(function (d) {
                return 1500 + d * 150;
            })
            .style("opacity", 1);
    } else {
        this.selectAll(".legend rect")
            .transition()
            .duration(3000)
            .attr("x", offset - margins.right + legendShift)
            .attr("y", function(d) {
                return margins.top + d * length;
            })
            .attr("width", legendShift)
            .attr("height", length)
            .style("fill", function (d) {
                return colorScale(d / 10);
            });
        this.selectAll(".legend text")
            .transition()
            .duration(3000)
            .attr("x", offset - margins.right + 2*legendShift + 5)
            .attr("y", function (d) {
                return margins.top + d * length + length / 2;
            });
    }

    return this;
};

matrix.add_data = function(scales, data, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var colorScale = scales.color;
    var sideScale = scales.side;
    var ndim = sideScale.domain().slice(-1);
    var results = data.experiment.results;

    var side = sideScale(1) - sideScale(0);

    var rects = this.append("g")
        .classed("data", true)
        .classed("plot"+data.id, true)
        .selectAll("rect")
        .data(d3.range(Math.pow(ndim, 2)))
        .enter()
        .append("rect")
        .classed("bordered", true)
        .attr("x", function(d) {
            return sideScale(d%ndim) + side/2;
        })
        .attr("y", function(d) {
            return sideScale(Math.floor(d/ndim)) + side/2;
        })
        .attr("width", 0)
        .attr("height", 0)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", "FFF")
        .transition()
        .duration(3000)
        .attr("x", function(d) {
            return sideScale(d%ndim);
        })
        .attr("y", function(d) {
            return sideScale(Math.floor(d/ndim));
        })
        .attr("width", side)
        .attr("height", side)
        .style("fill", function(d) {
            var total = d3.sum(results[data.experiment.max_epoch-1].matrix[Math.floor(d/ndim)]);
            return colorScale(results[data.experiment.max_epoch-1].matrix[Math.floor(d/ndim)][d%ndim] / total);
        });

    var text = this.append("g")
        .classed("data", true)
        .classed("plot"+data.id, true)
        .selectAll("text")
        .data(d3.range(Math.pow(ndim, 2)))
        .enter()
        .append("text")
        .attr("x", function(d) {
            return sideScale(d%ndim) + side/2;
        })
        .attr("y", function(d) {
            return sideScale(Math.floor(d/ndim)) + side/2;
        })
        .text(function(d) {
            var total = d3.sum(results[data.experiment.max_epoch-1].matrix[Math.floor(d/ndim)]);
            return (results[data.experiment.max_epoch-1].matrix[Math.floor(d/ndim)][d%ndim] / total).toFixed(2);
        })
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#FFF")
        .style("opacity", 0)
        .transition()
        .duration(1500)
        .delay(1500)
        .style("opacity", 1);

    // Scale the transition speed so that the total length is always 10 secs
    /*
    var speed = 10000/(results.length-1);
    var delayScale = d3.scale.linear()
        .domain([1, results.length-1])
        .range([3000, 13000-speed]);

    for (var i=1; i < results.length; i++) {
        rects.transition()
            .duration(speed)
            .delay(delayScale(i))
            .style("fill", function(d) {
                var total = d3.sum(results[i].matrix[Math.floor(d/ndim)]);
                return colorScale(results[i].matrix[Math.floor(d/ndim)][d%ndim] / total);
        });
        text.transition()
            .duration(speed)
            .delay(delayScale(i))
            .text(function(d) {
                var total = d3.sum(results[i].matrix[Math.floor(d/ndim)]);
                return (results[i].matrix[Math.floor(d/ndim)][d%ndim] / total).toFixed(2);
        });
    }*/
    return this;
};

matrix.update_data = function(scales, data, options) {
    var h = this.attr("height");
    var w = get_container_width(this);
    var colorScale = scales.color;
    var sideScale = scales.side;
    var ndim = sideScale.domain().slice(-1);
    var mArray = data.experiment.results[data.experiment.results.length - 1].matrix;

    var side = sideScale(1) - sideScale(0);

    this.selectAll(".data.plot"+data.id+" rect")
        .transition()
        .duration(3000)
        .attr("x", function(d) {
            return sideScale(d%ndim);
        })
        .attr("y", function(d) {
            return sideScale(Math.floor(d/ndim));
        })
        .attr("width", side)
        .attr("height", side)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", function(d) {
            var total = d3.sum(mArray[Math.floor(d/ndim)]);
            return colorScale(mArray[Math.floor(d/ndim)][d%ndim] / total);
        });
    this.selectAll("data.plot"+data.id+" text")
        .transition()
        .duration(3000)
        .attr("x", function(d) {
            return sideScale(d%ndim) + side/2;
        })
        .attr("y", function(d) {
            return sideScale(Math.floor(d/ndim)) + side/2;
        })
        .text(function(d) {
            var total = d3.sum(mArray[Math.floor(d/ndim)]);
            return (mArray[Math.floor(d/ndim)][d%ndim] / total).toFixed(2);
        })
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#FFF")
        .style("opacity", 1);
    return this;
};