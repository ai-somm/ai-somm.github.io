
d3.tsv("jrvintages_score_uni.tsv", function loadCallback(error, data) {
                data.forEach(function(d) { // convert strings to numbers
                    d.uniscore = +d.uniscore;
                    d.year = +d.year;
                });
                makeVis(data);
            });

var makeVis = function(data) {
              // Common pattern for defining vis size and margins
              var margin = { top: 20, right: 20, bottom: 30, left: 40 },
                  width  = 960 - margin.left - margin.right,
                  height = 500 - margin.top - margin.bottom;

              // Add the visualization svg canvas to the vis-container <div>
              var canvas = d3.select("#vis-container").append("svg")
                  .attr("width",  width  + margin.left + margin.right)
                  .attr("height", height + margin.top  + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // Define our scales
              var colorScale = d3.scale.category10();

              var xScale = d3.scale.linear()
                  .domain([ d3.min(data, function(d) { return d.year; }) - 1,
                            d3.max(data, function(d) { return d.year; }) + 1 ])
                  .range([0, width]);

              var yScale = d3.scale.linear()
                  .domain([ d3.min(data, function(d) { return d.uniscore; }) ,
                            d3.max(data, function(d) { return d.uniscore; }) ])
                  .range([height, 0]); // flip order because y-axis origin is upper LEFT

              var brush = d3.svg.brush()
                  //.scale(xScale)
                  .on("brush", brushmove)
                  .on("brushend", brushend);

                  //console.log(brush == null)
              // Define our axes
              var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient('bottom');
                  //.ticks(2017-1962);

              var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left');

              // Add x-axis to the canvas
              canvas.append("g")
                  .attr("class", "x axis")
                  .attr("clip-path", "url(#clip)")
                  .attr("transform", "translate(0," + height + ")") // move axis to the bottom of the canvas

                  .call(xAxis)
                .append("text")
                  .attr("class", "label")
                  .attr("x", width) // x-offset from the xAxis, move label all the way to the right
                  .attr("y", -6)    // y-offset from the xAxis, moves text UPWARD!
                  .style("text-anchor", "end") // right-justify text
                  .text("Vintage");

              // Add y-axis to the canvas
              canvas.append("g")
                  .attr("class", "y axis") // .orient('left') took care of axis positioning for us
                  .call(yAxis)
                .append("text")
                  .attr("class", "label")
                  .attr("transform", "rotate(-90)") // although axis is rotated, text is not
                  .attr("y", 15) // y-offset from yAxis, moves text to the RIGHT because it's rotated, and positive y is DOWN
                  .style("text-anchor", "end")
                  .text("Sentiment");

              canvas.append("g")
                  .attr("class", "brush")
                  .call(brush)
                  .selectAll('rect')
                  .attr('height', height);

              canvas.append("defs").append("clipPath")
                  .attr("id", "clip")
                  .append("rect")
                  .attr("width", width)
                  .attr("height", height + 20);
              // Add the tooltip container to the vis container
              // it's invisible and its position/contents are defined during mouseover
              var tooltip = d3.select("#vis-container").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

              // tooltip mouseover event handler
              var tipMouseover = function(d) {
                  var color = colorScale(d.region);
                  var html  = "<b><span style='color:" + color + ";'>" + d.region + "</span><br/>" +
                              " Vintage " + d.year + "<br/>"+
                  d.review +"</b>";

                  tooltip.html(html)
                      .style("left", (d3.event.pageX + 15) + "px")
                      .style("top", (d3.event.pageY - 28) + "px")
                    .transition()
                      .duration(200) // ms
                      .style("opacity", 1) // started as 0!

              };
              // tooltip mouseout event handler
              var tipMouseout = function(d) {
                  tooltip.transition()
                      .duration(300) // ms
                      .style("opacity", 0); // don't care about position!
              };

              // Add data points!
              points = canvas.selectAll(".dot")
                .data(data)
              .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 5.5) // radius size, could map to another data dimension
                .attr("clip-path", "url(#clip)")
                .attr("cx", function(d) { return xScale( d.year ); })     // x position
                .attr("cy", function(d) { return yScale( d.uniscore ); })  // y position
                .style("fill", function(d) { return colorScale(d.region); })
                .on("mouseover", tipMouseover)
                .on("mouseout", tipMouseout);

                points.on('mousedown', function(){
                  brush_elm = canvas.select(".brush").node();
                  new_click_event = new Event('mousedown');
                  new_click_event.pageX = d3.event.pageX;
                  new_click_event.clientX = d3.event.clientX;
                  new_click_event.pageY = d3.event.pageY;
                  new_click_event.clientY = d3.event.clientY;
                  brush_elm.dispatchEvent(new_click_event);
                });

                function brushmove() {
                var extent = brush.extent();
                points.classed("selected", function(d) {
                  is_brushed = extent[0] <= d.index && d.index <= extent[1];
                  return is_brushed;
                });
}

function brushend() {
  get_button = d3.select(".clear-button");
  if(get_button.empty() === true) {
    clear_button = canvas.append('text')
      .attr("y", 460)
      .attr("x", 825)
      .attr("class", "clear-button")
      .text("Clear Brush");
  }

  yScale.domain(brush.extent());
  //xScale.domain(brush.extent());

  transition_data();
  reset_axis();

  points.classed("selected", false);
  d3.select(".brush").call(brush.clear());

  clear_button.on('click', function(){
    x.domain([1961, 2018]);
    transition_data();
    reset_axis();
    clear_button.remove();
  });
}

function transition_data() {
  canvas.selectAll(".dot")
    .data(data)
  .transition()
    .duration(500)
    //.attr("cx", function(d) { return x(d.index); });
    .attr("cx", function(d) { return xScale( d.year ); });
}

function reset_axis() {
  canvas.transition().duration(500)
   .select(".x.axis")
   .call(xAxis);
}
};