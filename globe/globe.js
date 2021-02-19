// This is an example Chiasm plugin based on this D3 Canvas example:
// http://bl.ocks.org/mbostock/ba63c55dd2dbc3ab0127
function Globe (){

  var my = ChiasmComponent({
    backgroundColor: "black",
    foregroundColor: "white",
    center: [0, 0],
    bounds: null,
    zoom: 1,
    sens: 0.25
  });

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  
  var projection = d3.geo.orthographic()
    .clipAngle(90);

  var path = d3.geo.path()
    .projection(projection)
    .context(context);

  // Interaction that lets the user rotate the globe.
  // Draws from http://bl.ocks.org/KoGor/5994804
  d3.select(canvas)
    .call(d3.behavior.drag()
      .origin(function() {
        var r = projection.rotate();
        return {
          x: r[0] / my.sens,
          y: -r[1] / my.sens
        };
      })
      .on("drag", function() {
        var lng = -d3.event.x * my.sens;
        var lat = d3.event.y * my.sens;
        
        // Disallow rotation beyond the poles.
        lat = lat > 89 ? 89 : lat < -89 ? -89 : lat;

        my.center = [ lng, lat ];
      }));


  // Hand off the DOM element to the Chiasm layout plugin, which will inject it
  // into the parent container for us when we specify the special property `el`.
  my.el = canvas;

  // The following will all change at runtime, but they are set to some value to
  // handle the case that the render function gets run before they are updated.
  my.box = {
    width: 960,
    height: 600
  };
  my.radius = my.box.height / 2 - 5;
  my.scale = my.radius;

  my.when("box", function (box){
    canvas.width = box.width;
    canvas.height = box.height;
    projection.translate([box.width / 2, box.height / 2]);
    my.radius = box.height / 2 - 5;
  });

  my.when("radius", function (radius){
    my.scale = radius;
  });

  my.when("bounds", function (bounds){
    my.bounds = bounds;
  });

  my.when("scale", function (scale){
    projection.scale(my.scale);
  });

  my.when("center", function (center){
    var lat = center[1];

    my.rotate = [ -center[0], -center[1] ];
  });

  my.when("rotate", function (rotate){
    projection.rotate(rotate);
  });

  function toRadians(deg){
    return deg / 180 * Math.PI;
  }

  d3.json("world-110m.json", function(error, world) {
    if (error) throw error;

    var land = topojson.feature(world, world.objects.land);

    d3.timer(function(elapsed) {
      context.fillStyle = my.backgroundColor;
      context.fillRect(0, 0, my.box.width, my.box.height);

      context.fillStyle = my.foregroundColor;
      context.strokeStyle = my.foregroundColor;

      context.beginPath();
      path(land);
      context.fill();

      // Stop the code from crashing with transient states that happen on page load.
      var radius = my.radius < 1 ? 1 : my.radius;

      context.beginPath();
      context.arc(my.box.width / 2, my.box.height / 2, radius, 0, 2 * Math.PI, true);
      context.lineWidth = 2.5;
      context.stroke();


      // This makes the circle invert whatever color is underneath it.
      context.save();
      context.globalCompositeOperation = "difference";
      context.strokeStyle = "white";

      // Draw the bounding box that represents the current map view.
      context.beginPath();
      if (my.bounds) {
        path({type: "Polygon", coordinates: [[
          [my.bounds.getWest(), my.bounds.getSouth()],
          [my.bounds.getEast(), my.bounds.getSouth()],
          [my.bounds.getEast(), my.bounds.getNorth()],
          [my.bounds.getWest(), my.bounds.getNorth()],
          [my.bounds.getWest(), my.bounds.getSouth()]
        ]]});
      }
      context.lineWidth = 2.5;
      context.stroke();

      // This is the inverse of context.save(), it pops off the context stack so
      // we get back whatever the previous value was for
      // globalCompositeOperation.
      context.restore();
    });
  });

  return my;
}
