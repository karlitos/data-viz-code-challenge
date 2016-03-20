/* Some definitions, will be probably moved to a separate configuration file later*/
var originColor = d3.rgb(255, 145, 0),
  originOpacity = .6,
  originStrokeColor = d3.rgb(38, 38, 38),
  destintionColor = d3.rgb(24, 0, 134),
  destinationOpacity = originOpacity,
  destinationStrokeColor = originStrokeColor,
  connectionStrokeOpacity = .2;
/* Define date format globally since it will be used for parsing and formating on different places */
var dateTimeFormat = d3.time.format('%Y-%m-%d %H:%M:%S');


// var layerUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
// var attribution = '&copy; ' + mapLink + ' Contributors'

var layerUrl = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
var attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// var layerUrl = 'http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png';
// var	attribution = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

var map = new L.map('map').setView([52.5182, 13.4077], 12);
L.tileLayer(layerUrl, {
  attribution: attribution,
  maxZoom: 18,
}).addTo(map);

/* Initialize the SVG layer */
map._initPathRoot()
// after the 0.7 version following initialization should be used instead
//L.svg().addTo(map);

/* We simply pick up the SVG from the map object */
var svg = d3.select('#map').select('svg');

/* We define gradient color for the line*/
var connectionGradient = svg.append('defs')
.append('linearGradient')
.attr('id', 'connectionGradient')
.attr('x1', '0%')
.attr('y1', '0%')
.attr('x2', '100%')
.attr('y2', '100%')
.attr('spreadMethod', 'pad');

connectionGradient.append('stop')
.attr('offset', '0%')
.attr('stop-color', originColor)
.attr('stop-opacity', 1);

connectionGradient.append('stop')
.attr('offset', '100%')
.attr('stop-color', destintionColor)
.attr('stop-opacity', 1);

// Define the div for the tooltip
var div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

/* Grouping of all the SVG Elements representing the connections*/
var g = svg.append('g');

var searches = [];
d3.csv('data/searches.csv', function(d) {
  function parseCoordinates(coordinates){
    // pasre the input string and convert it into array
    coordinates = coordinates.match(/-?\d+\.\d+/g);
    // error handling has to happen here in case the parsing returned null
    return new L.LatLng(coordinates[1], coordinates[0]);
  }

  return {
    at: dateTimeFormat.parse(d.at), // convert the timestamp to date
    origin: parseCoordinates(d.origin),
    destination: parseCoordinates(d.destination),
  };
}, function(error, rows) {
  searches = rows;
  console.log('searches', searches);

  /* The data selection used for further data binding */
  var selection = g.selectAll('circle')
  .data(searches, function(d){return d.at;})
  .enter();

  /* The graphical elements visualizing the origins */
  var origins = selection.append('circle')
  .style('stroke', originStrokeColor)
  .style('opacity', originOpacity)
  .style('fill', originColor)
  .attr('id', function(d, i) { return 'origin' + i; });

  /* The graphical elements visualizing the destinastions */
  var destinations = selection.append('circle')
  .style('stroke', destinationStrokeColor)
  .style('opacity', destinationOpacity)
  .style('fill', destintionColor)
  .attr('id', function(d, i) { return 'destination' + i; });

  /* The graphical elements visualizing the connections */
  var connections = selection.append('line')
  .style('stroke', "url(#connectionGradient)")
  .style('stroke-opacity', connectionStrokeOpacity)
  .attr('x1', function (d) { return map.latLngToLayerPoint(d.origin).x; })
  .attr('y1', function (d) { return map.latLngToLayerPoint(d.origin).y; })
  .attr('x2', function (d) { return map.latLngToLayerPoint(d.destination).x; })
  .attr('y2', function (d) { return map.latLngToLayerPoint(d.destination).y; })
  .attr('id', function(d, i) { return 'connection' + i; })
  .on('mouseover', function(d) {
    d3.select(this).style('stroke-opacity', 1);
    div.transition()
    .duration(100)
    .style('opacity', .9);
    div.html(dateTimeFormat(d.at))
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY - 30) + 'px');
  })
  .on('mouseout', function(d) {
    d3.select(this).style('stroke-opacity', connectionStrokeOpacity);
    div.transition()
    .duration(100)
    .style('opacity', 0);
  });

  /* The update function taking care of placing and resizing of the overlayed elements*/
  function update() {
    origins.attr('cx',function(d) { return map.latLngToLayerPoint(d.origin).x; });
    origins.attr('cy',function(d) { return map.latLngToLayerPoint(d.origin).y; });
    origins.attr('r',function(d) {
      return map.getZoom() < 13 ? 0.000732422*Math.pow(2,map.getZoom()) : 0.000488281*Math.pow(2,map.getZoom());
    });
    destinations.attr('cx',function(d) { return map.latLngToLayerPoint(d.destination).x; });
    destinations.attr('cy',function(d) { return map.latLngToLayerPoint(d.destination).y; });
    destinations. attr('r',function(d) {
      return map.getZoom() < 13 ? 0.000732422*Math.pow(2,map.getZoom()) : 0.000488281*Math.pow(2,map.getZoom());
    });
    connections.attr('x1', function (d) { return map.latLngToLayerPoint(d.origin).x; });
    connections.attr('y1', function (d) { return map.latLngToLayerPoint(d.origin).y; });
    connections.attr('x2', function (d) { return map.latLngToLayerPoint(d.destination).x; });
    connections.attr('y2', function (d) { return map.latLngToLayerPoint(d.destination).y; });
    connections.attr('stroke-width', function (d) {
      return map.getZoom() < 13 ? 0.000732422*Math.pow(2,map.getZoom()) : 0.000488281*Math.pow(2,map.getZoom());
    });
  }
  map.on('viewreset', update);

  /* Noting few size-related parameters for easier computation */
  var timeEventsContainer = d3.select('#brush'),
  width = timeEventsContainer.node().offsetWidth,
  margin = {
    top: parseInt(timeEventsContainer.style('margin-top')),
    right: parseInt(timeEventsContainer.style('margin-right')),
    bottom: parseInt(timeEventsContainer.style('margin-bottom')),
    left: parseInt(timeEventsContainer.style('margin-left'))
   },
  height = timeEventsContainer.node().offsetHeight;

  /* Time scale for all searches in the given data*/
  var timeExtent = d3.extent(searches, function(d) {
    return d.at;
  });

  /* The svg container for the time-data */
  var svg2 = timeEventsContainer.append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

  var context = svg2.append('g')
  .attr('class', 'context')
  .attr('transform', 'translate(' +
  margin.left + ',' +
  margin.top + ')');

  var x = d3.time.scale()
  .range([0, width])
  .domain(timeExtent);

  var brush = d3.svg.brush()
  .x(x)
  .on('brushend', brushend);

  /* Same selection as before on another element*/
  var selection2 = context.selectAll('rect')
  .data(searches, function(d){return d.at;})
  .enter()

  /* Add all the search-timestamps as narrow, opaque bars*/
  selection2.append('rect')
  .attr('transform', function(d) {
    return 'translate(' + [x(d.at), 0] + ')';
  })
  .attr('width', 2)
  .attr('height', '100%')
  .attr('opacity', 0.3)
  .attr('fill', originColor)
  .on('mouseover', function(d) {
    d3.select(this).attr('fill', originStrokeColor).style('opacity', 1);
    div.transition()
    .duration(100)
    .style('opacity', .9);
    div.html(dateTimeFormat(d.at))
    .style('left', (d3.event.pageX) + 'px')
    .style('top', (d3.event.pageY - 30) + 'px');
  })
  .on('mouseout', function(d) {
    d3.select(this).attr('fill', originColor).style('opacity', 0.3);
    div.transition()
    .duration(100)
    .style('opacity', 0);
  });

  /* The brush selection area*/
  context.append('g')
  .attr('class', 'x brush')
  .call(brush)
  .selectAll('rect')
  .style('opacity', .3)
  .style('visibility', 'visible')
  .attr('fill', originStrokeColor)
  .attr('stroke', 'black')
  .attr('stroke-width', 2)
  .attr('y', +height/2)
  .attr('height', height/2);

  function brushend() {}
  /* Calling the update function when everything else is set up*/
  update();
});