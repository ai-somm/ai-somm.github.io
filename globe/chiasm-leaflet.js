// This is an example Chaism plugin that uses Leaflet.js.
function ChiasmLeaflet() {

  var my = ChiasmComponent({ });

  // Expose a div element that will be added to the Chiasm container.
  // This is a special property that Chiasm looks for after components are constructed.
  my.el = document.createElement("div");

  // When you zoom out all the way, this line makes the background black
  // (by default it is gray).
  d3.select(my.el).style("background-color", "black");

  var map = L.map(my.el, {
    attributionControl: false
  }).setView([39.859, -4.592], 5);

  // Add the black & white style map layer.
  // Found by browsing http://leaflet-extras.github.io/leaflet-providers/preview/
  //L.tileLayer("http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png").addTo(map);
  L.tileLayer("http://{s}.tiles.earthatlas.info/natural-earth/{z}/{x}/{y}.png").addTo(map);
  // Also try this 

  function getCenter(){
    var center = map.getCenter();
    return [center.lng, center.lat];
  }

  function setCenter(center){
    map.off("move", onMove);
    map.panTo(L.latLng(center[1], center[0]), {
      animate: false
    });
    my.bounds = map.getBounds();
    map.on("move", onMove);
  }

  map.on("move", onMove);

  function onMove(){
    my.center = getCenter();
    my.zoom = map.getZoom();
    my.bounds = map.getBounds();
  }

  // If the center was set externally, pan the map to that center.
  my.when("center", function (center){
    if(!equal(center, getCenter())){
      setCenter(center);
    }
  });

  function equal(a, b){
    return JSON.stringify(a) === JSON.stringify(b);
  }

  my.when("box", function (box) {
    d3.select(my.el)
      .style("width", box.width + "px")
      .style("height", box.height + "px");
    map.invalidateSize();
  });

  return my;
}