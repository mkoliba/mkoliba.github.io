var lineGenerator = d3.line()
	.curve(d3.curveCardinal);
var gdata;
d3.csv("data/AlltripGender.csv", function(data)
{
	gdata = data;
	drawline(1);
});

var x = d3.scaleLinear().range([0, 600 - margin.left - margin.right]),
    y = d3.scaleLinear().range([500 - margin.top - margin.bottom, 0]);

var gendersvg = d3.select('#line')
	.append('svg');
	
gendersvg.attr('width',600)
	.attr('height',500)
	.append("g")
	.attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

var menline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.Category); })
	.y(function(d) { return y(d.tripduration); });
		
var womenline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.Category); })
	.y(function(d) { return y(d.tripduration); });
		
var unknownline = d3.line()
	.curve(d3.curveBasis)
	.x(function(d) { return x(d.Category); })
	.y(function(d) { return y(d.tripduration); });

function drawline(Day) {
	if (Day < 10) Day = "0" + Day;
	
	var mendaydata = gdata.filter(function(d){return d.Day == Day && d.gender == 1;});
	var womendaydata = gdata.filter(function(d){return d.Day == Day && d.gender == 2;});
	var unknowndaydata = gdata.filter(function(d){return d.Day == Day && d.gender == 0;});	

	var alldaydata = gdata.filter(function(d){return d.Day == Day});

	x.domain([0,15]);
	
	var max_value1 = d3.max(alldaydata, function(d) {
	        return +d.tripduration;
	});
	console.log(max_value1);
	y.domain([0, max_value1]);
	
	gendersvg.selectAll('path')
	        .remove();
	
	gendersvg.append("path")
		.data([mendaydata])
		.attr("class", "line")
      		.attr("d", menline)
      		.attr("stroke", "blue")
                .attr("stroke-width", 2)
      		.attr("fill","none")
      		.attr('transform', 'translate(' + margin.left + ',0)');

	gendersvg.append("path")
		.data([womendaydata])
		.attr("class", "line")
      		.attr("d", womenline)
      		.attr("stroke", "red")
		.attr("stroke-width", 2)
      		.attr("fill","none")
      		.attr('transform', 'translate(' + margin.left + ',0)');

	gendersvg.append("path")
		.data([unknowndaydata])
		.attr("class", "line")
      		.attr("d", unknownline)
      		.attr("stroke", "green")
		.attr("stroke-width", 2)
      		.attr("fill","none")
      		.attr('transform', 'translate(' + margin.left + ',0)');
      		
      	gendersvg.selectAll('g')
      	.remove();
      			  var ticks = ["88","83","78","73","68","63","58","53","48","43"
      			,"38","33","28 ","23","18"," 14"];
      	
      	gendersvg.append("g")
		.attr("transform", "translate(" + margin.left + "," + height + ")")
		.call(d3.axisBottom(x).ticks(15).tickFormat(function(d){return ticks[d];}))		.append("text")
		.attr("fill", "#000")
		.attr("y", -15)
		.attr("dy", "0.71em")
		.attr("font-size", "12px")
		.attr("x",450)
		.attr("text-anchor", "start")
		.text("Age Range");;
	
	gendersvg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("font-size", "12px")
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Average trip duration");


}

var genderslider = d3.select('#gender');
genderslider.on('change', function() {
	drawline(this.value);
});
