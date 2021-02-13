// set the dimensions and margins of the graph
let margin = { top: 20, right: 20, bottom: 60, left: 60 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
let x = d3.scaleLinear().domain([1960, 2020]).range([0, width]);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

//Add x-axis label:
svg
  .append("text")
  .attr(
    "transform",
    "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")"
  )
  .style("text-anchor", "middle")
  .text("Vintage");

// Add Y axis
let y = d3.scaleLinear().domain([0, 1.0]).range([height, 0]);
svg.append("g").call(d3.axisLeft(y));

//Add y-axis label:
svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", 0 - height / 2)
  .style("text-anchor", "middle")
  .text("Sentiment");

//Color scale: input a region name, output a color
let color = d3.scaleOrdinal()
  .domain([
    "ARGENTINA", "SOUTH AUSTRALIA", "AUSTRIA", "CHILE", "ALSACE", "CHAMPAGNE", 
    "LOIRE VALLEY", "SOUTHERN RHÔNE", "BORDEAUX - RED", "BORDEAUX - WHITE", 
    "BURGUNDY - WHITE", "LANGUEDOC-ROUSSILLON", "NORTHERN RHÔNE", 
    "GERMANY", "PIEMONTE", "TUSCANY", "NEW ZEALAND", "PORT AND THE DOURO", 
    "SOUTH AFRICA", "CATALUNYA", "RIOJA AND RIBERA DEL DUERO", "ENGLAND", 
    "NORTHERN CALIFORNIA", "BORDEAUX - SWEET", "BURGUNDY - RED",])
  .range(["Aqua", "Biege", "Blue", "BlueViolet", "Chocolate", 
    "Coral", "Crimson", "Cyan", "DarkOrchid", "DeepPink", 
    "Fuchsia", "Gold", "Green", "Grey", "HotPink", "Indigo", 
    "Khaki", "Lime", "Magenta", "Maroon", "Navy", "Olive", 
    "Purple", "Tomato", "Turquoise"]);
//let color = d3.schemePaired();//d3.scale.category20();

//Read the data
let promises = [d3.tsv("https://somm-ai.github.io/vintage/jrvintages_score_uni.tsv")];
let allData = [];

Promise.all(promises).then(function (data) {
  data.forEach(function (eachDataset) {
    eachDataset.forEach(function (d) {
      d["uniscore"] = +d["uniscore"];
      d["sentiment"] = +d["sentiment"];
      if (
        d.hasOwnProperty(
          "year"
        )
      ) {
        d[
          "year"
        ] = +d[
          "year"
        ];
      }
    });
  });

  allData = data;

  updateChart(allData);
});

//Add in event listener for geographic choice.
$("#geographicChoice").on("change", function () {
  updateChart(allData);
});

//Add in event listener for Year choice.
$("#sentiChoice").on("change", function () {
  updateChart(allData);
});

//Can I make updates based on new x-axis variable w/o update? If so, add to blog, i.e. rinse and repeat.

//Function that builds the right chart depending on user choice on website:
function updateChart(someData) {
  let dataJR = d3
    .nest()
    .key(function (d) {
      return d["sentiment"];
    })
    .entries(someData[0]);

  let selectedSentiment = $("#sentiChoice").val();

  let filteredData = dataJR.filter(
    (each) => each.key === selectedSentiment
  )[0];

  filteredData =
    $("#geographicChoice").val() === "allregion"
      ? filteredData["values"]
      : filteredData["values"].filter(
          (each) => each["region"] === $("#geographicChoice").val()
        );

  // JOIN data to elements.
  let circles = svg.selectAll("circle").data(filteredData, function (d) {
    return d["uniscore"]; //column not used???
  });

  console.log(circles);

  //EXIT old elements not present in new data.
  circles.exit().remove();

  //UPDATE existing elements to new position in graph:
  circles
    .attr("cy", function (d) {
      return y(d["uniscore"]);
    })
    .attr("cx", function (d) {
      return x(
        d[
          "year"
        ]
      );
    });

  // ENTER new elements present in new data.
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .attr("fill", function (d) {
      return color(d["region"]);
    })
    .attr("cy", function (d) {
      return y(d["uniscore"]);
    })
    .attr("cx", function (d) {
      return x(
        d[
          "year"
        ]
      );
    })
    .attr("r", 5.5);
}