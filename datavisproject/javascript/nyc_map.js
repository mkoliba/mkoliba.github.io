var mapwidth = 800,
    mapheight = 450;
    
var projection;

var mapsvg = d3.select("#nyc_map")
    .attr("width", mapwidth)
    .attr("height", mapheight);

var zoom_group = mapsvg.append("g");	
var nyc_map_group = zoom_group.append("g");
var njc_map_group = zoom_group.append("g");
var projection = d3.geoMercator();
var path;

d3.json("data/NYC_MapInfo.geojson", function(error, NYC_MapInfo) {
	//.log(projection.scale());
	
	projection.center([40.774986, -73.946488]).angle([-55]).fitExtent([[-300, -80],[mapwidth+500, mapheight+600]], NYC_MapInfo);
	
	

	//projection.scale(89382.38598763589);

	

    path = d3.geoPath().projection(projection);
    
	
	nyc_map_group.selectAll("path")
		.data(NYC_MapInfo.features)
		.enter()
		.append("path")
    		.attr("d", path)
		.style("fill", function(d) {
			// var BoroName = d.properties.BoroName;
			// if (BoroName == "Staten Island") return "#ffdead";
			// else if (BoroName == "Queens") return "#53868b";
			// else if (BoroName == "Brooklyn") return "#2F4F4F";
			// else if (BoroName == "Manhattan") return "#006400";
			// else if (BoroName == "Bronx") return "#ccc";
			// else 
				return "#cbcbcb";
        })
        .attr("class", function(d) {
			var BoroName = d.properties.BoroName;
			if (BoroName == "Staten Island") return "Staten-Island";
			else if (BoroName == "Queens") return "Queens";
			else if (BoroName == "Brooklyn") return "Brooklyn";
			else if (BoroName == "Manhattan") return "Manhattan";
			else if (BoroName == "Bronx") return "Bronx";
			else return "other";
		})
		.style("fill-opacity","1")
		// .on("mouseover",function(d) {
		// 	d3.select(this).style("fill-opacity","1");
		// })
		// .on("mouseout",function(d) {
		// 	d3.selectAll("path").style("fill-opacity","0.7");
		// });
		
	nyc_map_group.selectAll("text")
	.data(NYC_MapInfo.features)
	.enter().append("svg:text")
	.attr("dy",".35em")
	.text(function(d) {return d.properties.BoroName; })
	.attr("transform" ,function(d){
		return "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")";
	})
	.style("text-anchor","middle");
    draw_NJC_map();
	draw_points();
    
});

//create zoom handler 
var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

//specify what to do when zoom event listener is triggered 
function zoom_actions(){
	
	zoom_group.attr("transform", d3.event.transform);
	
}

zoom_handler(mapsvg);

function draw_NJC_map (){
	d3.json("data/jerseycityzipcodegeojson.geojson", function(error, njc_map_data) {
		
		njc_map_group.selectAll("path")
		.data(njc_map_data.features)
		.enter()
		.append("path")
			.attr("d", path)
		.style("fill", "#CCC")
		.style("fill-opacity","0.7")
		// .on("mouseover",function(d) {
		// 	d3.select(this).style("fill-opacity","1");
		// })
	
	
	});
}

//##################################################################


var point_group = zoom_group.append("g");

var station_data;

function relative_difference(out_r, in_r){
	if (out_r == 0 && in_r == 0){
		return 0
	}
	
	output = (out_r - in_r)/( (Math.abs(out_r) + Math.abs(in_r)) / 2);
	
	return output;
}

function toPaddedHexString(num, len) {
	num = Math.floor(num);
	var str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}




// function color_scale(x){
// 	var red, blue;
// 	if (x>0){
// 		blue = 255;
// 		red = 255 - 255* (x/2) ;
// 	}
// 	else{
// 		red = 255;
// 		blue = 255 + 255 * (x/2) ;
// 	}
// 	rgb = '#' + toPaddedHexString(red,2) + '00' + toPaddedHexString(blue,2);
// 	return rgb;
// }

// var color = d3.scaleLinear()
//     .domain([-1,1])
//     .range(["#810082", "#ffa500"])
//     .interpolate(d3.interpolateCubehelix.gamma(3));

color = d3.scaleLinear().domain([-2,2])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("rgb(177, 109, 247)"), d3.rgb('#FFF500')]);

function draw_points(){
	d3.json("data/stations_rents_outin.json", function(error, rents_out_in) {
		
		station_data =rents_out_in;
		point_group.selectAll("circle")
			.data(rents_out_in.stations)
			.enter()
			.append("circle")
				.attr("cx", function(d) {
					if (d && d.lon && d.lat) 
						 return projection([d.lon, d.lat])[0]; })
				.attr("cy", function(d) {
					if (d && d.lon && d.lat) return projection([d.lon, d.lat])[1];
				})
				.attr("r", 3)
				//.attr("class", "non_brushed")
				.style("z-index", 4)
				.style("position", "relative")
				.style("fill", "#ff57a5")
				.style("stroke", "gray")
				.style("stroke-width", 0.25)
				.style("opacity", 0.75)
			.append("title") 
				.text(function(d) {
					return d.name; });


			//update_poits(1);
	});


}


function update_poits(index){
	

	out_in = station_data.values[index]
	
	point_group.selectAll("circle")
		.data(out_in)
		.style("fill", function(d){
			
			var diff =relative_difference(d[0],d[1]),
			rgb = color(diff);
			//.log(diff, rgb)
			return rgb;
		} )
		.selectAll("title")
    		.text(function(d,i){
				
				return d.name + " In: " + out_in[d.o][1] + " Out: " + out_in[d.o][0];
			});
		
}

//##############################################################

//Time line

var margin = {top: 20, right: 20, bottom: 40, left: 50};



var timeline_with = 5*144 ;//770 - margin.left - margin.right;
var timeline_height = 300 - margin.top - margin.bottom;

var timeline_svg = d3.select("#nyc_timeline")
	.attr("width", timeline_with + margin.left + margin.right)
	.attr("height", timeline_height + margin.top + margin.bottom);

var bar_plot = timeline_svg.append("g")
	.attr("class", "focus")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxisGroup = timeline_svg.append("g").attr("transform", "translate(" + margin.left + "," + (timeline_height + margin.top) + ")");
var yAxisGroup = timeline_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var xScale = d3.scaleLinear();
var yScale = d3.scaleLinear();

var formatMinutes = function(d) { 
    var hours = Math.floor(d / 6);
    var output = hours + 'h ';
    
    return output;
};

var timeline_data;

d3.json("data/rents_timeline.json", function(error, rent_bar_data) {

	timeline_data = rent_bar_data;
	xScale.domain([0,timeline_data.length]).rangeRound([0, timeline_with]);
	yScale.range([timeline_height, 0]).domain([0, d3.max(timeline_data, function (d) {
		return d;
		})]);

	

	var rects = bar_plot.append("g");

	//rects.attr("clip-path", "url(#clip)");

	rects.selectAll("rect")
		.data(timeline_data)
		.enter()
		.append("rect")
			.attr('class', 'rectContext')
			.attr("x", function (d,i) {
				return xScale(i)+1;
			})
			.attr("y", function (d) {
				return yScale(d);
			})
			.attr("width", Math.floor(timeline_with / timeline_data.length)-1)
			.attr("height", function (d) {
				return timeline_height - yScale(d)
			})
		.append("title") 
				.text(function(d) {
					return "Number of rents " + d.toString(); });

	yAxisGroup.attr("class", "y-axis").call(d3.axisLeft(yScale))

	xAxisGroup.attr("class", "x-axis")
		.call(
			d3.axisBottom(xScale)
				.tickFormat(formatMinutes)
				.tickValues(d3.range(0, timeline_data.length +1 , 6)))


	timeline_svg.append("text")
		.attr("transform", "translate(" + (timeline_with / 2) + "," + (timeline_height + margin.top + margin.bottom) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "15px")
		.text("Time");	

		timeline_svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - ((timeline_height+margin.bottom) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Number of rents on 1.3.2018");

})

var brush = d3.brushX()
				.extent([[0, 0], [timeline_with, timeline_height]])
				.on("start brush", brushed)
				.on("end", brushended);

var brush_group = bar_plot.append("g")
.attr("class", "brush")
.call(brush)
//.call(brush.move, [, 26].map(xScale))
.selectAll(".overlay")
.each(function(d) { d.type = "selection"; }) // Treat overlay interaction as move.
	.on("mousedown touchstart", brushcentered) // Recenter before brushing.
;


function brushcentered() {
	var dx = xScale(1) - xScale(0), // Use a fixed width when recentering.
	
		cx = d3.mouse(this)[0],
		x0 = cx - dx / 2,
		x1 = cx + dx / 2;
		
	d3.select(this.parentNode).call(brush.move, x1 > timeline_with ? [timeline_with - dx, timeline_with] : x0 < 0 ? [0, dx] : [x0, x1]);
  }
function brushed() {
	if (!d3.event.selection) return; // Ignore empty selections.

	var d0 = d3.event.selection.map(xScale.invert),
		d1 = d0.map(Math.round);
	if (d1[0] >= d1[1]) {
		d1[0] = Math.floor(d0[0]);
		d1[1] = d1[0] + 1;
		}
	
	update_poits(d1[0])
	
	//var extent = d3.event.selection.map(xScale.invert, xScale);
	
	//dot.classed("selected", function(d) { return extent[0] <= d[0] && d[0] <= extent[1]; });

  }
  
  function brushended() {
	if (!d3.event.sourceEvent) return; // Only transition after input.
	if (!d3.event.selection) return; // Ignore empty selections.
	var d0 = d3.event.selection.map(xScale.invert),
		d1 = d0.map(Math.round);
	
	// If empty when rounded, use floor & offset instead.
	if (d1[0] >= d1[1]) {
	  d1[0] = Math.floor(d0[0]);
	  d1[1] = d1[0] + 1;
	}
  
	d3.select(this).transition().call(brush.move, d1.map(xScale));

	//update_poits(d1[0])
}


function start_animation(){
	//move brush on begining
	var position = [0,1];

	//d3.select("g .brush").transition().call(brush.move, position.map(xScale));
	//console.log(timeline_data.length);
	for(var i = 0; i <= timeline_data.length ; i++){
		d3.select("g .brush")
			.transition()
			.duration(300)
			.delay(300*i)
			.call(brush.move, position.map(xScale));
		
		position = [i,i+1];
		//console.log(position);
	}

}

d3.select("#start_animation")
	.on("click", function(){
        start_animation();
	  });
	  
//#######################################################

//Legend

var legend = d3.select("#color-legent");
var    length = 50,
    color2 = d3.scaleLinear().domain([1,length])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("rgb(177, 109, 247)"), d3.rgb('#FFF500')]);



  for (var i = 0; i < length; i++) {
    legend.append('div').attr('style', function (d) {
      return 'background-color: ' + color2(i);
	})
	.attr("class", "color_scale");
  }