/**
 * Created by Matt on 7/22/2016.
 */

var max_width = +$("#graphs").css("width").slice(0,-2) - 80;
var max_height = 450;
var settings = {
    h: max_height,
    w: max_width,
    margins: {left: 65,
              right: 60,
              top: 60,
              bottom: 60}
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

/*
This section removes elements from the graphs and DOM
 */

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
    this.selectAll(".grid")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    this.selectAll(".legend")
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .transition()
        .delay(1501)
        .remove();
    return this;
}

function remove_data(data) {
    this.selectAll(".data.plot"+data.id)
        .transition()
        .duration(1500)
        .style("opacity", 0)
        .remove();
    return this;
}