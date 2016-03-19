/* Some definitions, will be probably moved to a separate configuration file later*/
var originColor = d3.rgb(255, 145, 0);
var originOpacity = .6;
var originStrokeColor = d3.rgb(38, 38, 38);
var destintionColor = d3.rgb(24, 0, 134);
var destinationOpacity = originOpacity;
var destinationStrokeColor = originStrokeColor;
var connectionStrokeOpacity = .2;


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

  /* Grouping of all the SVG Elements representing the connections*/
  var g = svg.append('g');

  var searches = [];
  d3.csv('data/searches.csv', function(d) {
    // define date format
    var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
    function parseCoordinates(coordinates){
      // pasre the input string and convert it into array
      coordinates = coordinates.match(/-?\d+\.\d+/g);
      // error handling has to happen here in case the parsing returned null
      return new L.LatLng(coordinates[1], coordinates[0]);
    }

    return {
      at: dateFormat.parse(d.at), // convert the timestamp to date
      origin: parseCoordinates(d.origin),
      destination: parseCoordinates(d.destination),
    };
  }, function(error, rows) {
    searches = rows;
    console.log('searches', searches);

    var selection = g.selectAll('circle')
    .data(searches, function(d){return d.at;})
    .enter();

    var origins = selection.append('circle')
    .style('stroke', originStrokeColor)
    .style('opacity', originOpacity)
    .style('fill', originColor)
    .attr('id', function(d, i) { return 'origin' + i; });

    var destinations = selection.append('circle')
    .style('stroke', destinationStrokeColor)
    .style('opacity', destinationOpacity)
    .style('fill', destintionColor)
    .attr('id', function(d, i) { return 'destination' + i; });

    var connections = selection.append('line')
    .style('stroke', "url(#connectionGradient)")
    .style('stroke-opacity', connectionStrokeOpacity)
    // .style('stroke-width', 2)
    .attr('x1', function (d) { return map.latLngToLayerPoint(d.origin).x; })
    .attr('y1', function (d) { return map.latLngToLayerPoint(d.origin).y; })
    .attr('x2', function (d) { return map.latLngToLayerPoint(d.destination).x; })
    .attr('y2', function (d) { return map.latLngToLayerPoint(d.destination).y; })
    .attr('id', function(d, i) { return 'connection' + i; })
    .on('mouseover', function(d) {
      d3.select(this).style('stroke-opacity', 1);
    })
    .on('mouseout', function(d) {
      d3.select(this).style('stroke-opacity', connectionStrokeOpacity);
    });

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
    update();
  });