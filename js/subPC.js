
let wordObj = {}, cars = []

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3v3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    dragging = {};

var line = d3v3.svg.line(),
    axis = d3v3.svg.axis().orient("left"),
    background,
    foreground;

var svg2 = d3v3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3v3.csv("data/vis-word-data.csv", function (error, data) {
    if (error) throw error;

    const removeList = ["%", "d", "-", "thing", "will"]
    const wordtype = ["VERB", "NOUN", "ADJ"]
    // console.log(data)

    let arr = data.map((datarow, weekIndex) => {
        let obj = {}
        let raw = JSON.parse(datarow.Words.split("'").join('"'))
        let row = d3v3.keys(raw)
            .filter(d => !removeList.includes(d))
            .map(d => {
                return {
                    text: modify(d),
                    frequency: raw[d].count,
                    type: raw[d].type,
                }
            })
            .sort((a,b) => +b.frequency - +a.frequency)

        row.forEach(d => {
            if (!wordObj[d.text]){
                wordObj[d.text] = {}
                wordObj[d.text]["week " + (weekIndex+1)] = d.frequency
                wordObj[d.text]["type"] = d.type
            }
            else {
                wordObj[d.text]["week " + (weekIndex+1)] = d.frequency
            }
        })

        cars = d3v3.keys(wordObj).map(d => {
            // fill the void
            for (let i = 1; i < 10; i++){
                if (!wordObj[d]["week " + i]){
                    wordObj[d]["week " + i] = 0
                }
            }
            let obj = {...wordObj[d]}
            obj.name = d
            obj.type = wordObj[d].type
            return obj
        })
        // .sort(function(a, b){
        // if(a.type < b.type) { return -1; }
        // if(a.type > b.type) { return 1; }
        // return 0;
        // })
    });

    // ------------------- visualize ----------------

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3v3.keys(cars[0]).filter(function(d) {
        return d != "name" && d != "type" && (y[d] = d3v3.scale.linear()
            .domain(d3v3.extent(cars, function(p) { return +p[d]; }))
            .range([height, 0]));
    }).sort());

    console.log(dimensions)
    // Add grey background lines for context.
    background = svg2.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(cars)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg2.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(cars)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke-width", 1.5)
        .attr("stroke", d => colorWord(d.type))
        .attr("stroke-opacity", 0.4)
    // .on("mouseover", function (d) {
    //     console.log(d)
    // });

    // Add a group element for each dimension.
    var g = svg2.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3v3.behavior.drag()
            .origin(function(d) { return {x: x(d)}; })
            .on("dragstart", function(d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
                dragging[d] = Math.min(width, Math.max(0, d3v3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function(a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function(d) {
                delete dragging[d];
                transition(d3v3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3v3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3v3.select(this).call(y[d].brush = d3v3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    // legend
    var legend = svg2.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(wordtype)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(-20," + (10+ i * 20) + ")"; });

    legend.append("circle")
        .attr("cx", width - 25)
        .attr("cy", 10)
        .attr("r", 6)
        .attr("height", 15)
        .attr("fill",  d => colorWord(d))
        .attr("stroke-width",2)

    legend.append("text")
        .attr("x", width - 10)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("font-size", "13px")
        .text((d,i) => wordtype[i].toLowerCase())

})


function modify(word) {
    if (word === "datum"){
        return "data"
    }
    else if (word === "r"){
        return "R"
    }
    else return word
}

function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g) {
    return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
    d3v3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
        extents = actives.map(function(p) { return y[p].brush.extent(); });
    foreground.style("display", function(d) {
        return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });
}
