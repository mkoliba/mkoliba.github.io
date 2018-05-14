var csvData;

//sorting date values
function sortByHourAscending(a, b) {
    return a.Hour - b.Hour;
}

d3.csv("data/DayTripsPerHour.csv", function(data)
{
    //Count the trips for each hour of the day
    data.sort(sortByHourAscending);
    csvData = data;
    draw(1);
});


//var width = document.getElementById('vis').clientWidth;
//var height = document.getElementById('vis').clientHeight;
var width = 600;
var height = 500;

var margin = {
    top: 10,
    bottom: 70,
    left: 70,
    right: 20
}

var svg = d3.select('#vis')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var x_scale = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

var y_scale = d3.scaleLinear()
    .range([height, 0]);

var colour_scale = d3.scaleQuantile()
    .range(["#00ea00", "#00e100","#00da00", "#00d100", "#00aa00", "#00a100", "#009a00","#009100", "#008a00", "#008100", "#007a00", "#007100", "#006a00", "#006100"]);

var x_axis = d3.axisBottom(x_scale);
var y_axis = d3.axisLeft(y_scale);

svg.append('g')
    	.attr('class', 'x axis')
    	.attr('transform', 'translate(0,' + height + ')')
;

svg.append('g')
	.attr('class', 'y axis')
	;

function draw(Day) {
    if (Day < 10) Day = "0" + Day;

    var daydata = csvData.filter(function(d){return d.Day == Day;});

    var t = d3.transition()
        .duration(2000);

    var Hours = daydata.map(function(d) {
        return d.Hour;
    });
    x_scale.domain(Hours);

    var max_value = d3.max(daydata, function(d) {
        return +d.count;
    });

    y_scale.domain([0, max_value]);
    colour_scale.domain([0, max_value]);

    var bars = svg.selectAll('.bar')
        .data(daydata)

    bars
        .exit()
        .remove();

    var new_bars = bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
            return x_scale(d.Hour);
        })
        .attr('width', x_scale.bandwidth())
        .attr('y', height)
        .attr('height', 0)

    new_bars.merge(bars)
        .transition(t)
        .attr('y', function(d) {
            return y_scale(+d.count);
        })
        .attr('height', function(d) {
            return height - y_scale(+d.count)
        })
        .attr('fill', function(d) {
            return colour_scale(+d.count);
        })

    svg.select('.x.axis')
        .call(x_axis);
    // text label for the x axis
  svg.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + 20) + ")")
  .style("text-anchor", "middle")
  .text("Hour");

    svg.select('.y.axis')
        .transition(t)
        .call(y_axis);

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of trips");        

}

var slider = d3.select('#day');
slider.on('change', function() {
    draw(this.value);
});