
let buildCount = 0;

function getChart(){
    return document.getElementById('chart-svg');
}

function getInputElement(){
    return document.getElementById('csvinput');
}

function getFile(){
    const inputElement = getInputElement();
    const file = inputElement.files ? inputElement.files[0] : undefined;
    if(file && file.type === "text/csv" && window.Worker && Papa){
        return file
    } else {
        return undefined;
    }
}

document.addEventListener("DOMContentLoaded",function(){
    const inputElement = getInputElement()
    if (inputElement.files[0]){
        processCSV();
    }
    if (inputElement) {
        inputElement.addEventListener("change", processCSV);
    }

    const clearFileButton = document.getElementById('clearfile');

    if (clearFileButton){
        clearFileButton.addEventListener("click", clearFile);
    }
}, false);

function clearFile(){
    if(getFile()){
        getInputElement().value = '';

    }
    if(getChart()){
        getChart().remove();

    }
}
function processCSV() {
    let dayNameAndCount = [{name:"sunday", count:0}, {name: "monday", count: 0},  {name:"tuesday", count:0}, {name: "wednesday", count:0}, {name: "thursday", count:0},  {name:"friday", count:0}, {name: "saturday", count:0}];
    const file = getFile();
    if (file) {
        Papa.parse(file, {
            worker: true,
            skipEmptyLines: 'greedy',
            header: true,
            chunk: function(results, parser) {
                //def gonna need to do error handling here
                results.data.map((element) => {
                    const orderDate = element['Order Date'];
                    if (orderDate) {
                        const date = new Date(orderDate);
                        const day = date.getDay();
                        dayNameAndCount[day].count += 1;
                    } else {
                        parser.abort();
                        alert("'Order Date' doens't exist in this file. Please verify you selected the right file, or email dayplanner@krysttian.com with details");
                        return undefined;
                    } 

                });
                buildCount = 0;
                buildGraph(dayNameAndCount);
            }
        });
    } else {
        alert("There was an error with your file, please make sure its the csv provided by amazon")
    }
}

function buildGraph(data) {
    buildCount += 1;
    console.dir(buildCount);
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "chart-svg")
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.name; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("class", (d) => d.name)
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); });

      svg.selectAll("text")
      .data(data)
      .enter().append("text")
      .text(function(d) {return d.count})
      .attr("class", "bar-text")
      .attr("x", function(d) { return x(d.name) + Math.abs(x.bandwidth()/2); })
      .attr("y", function(d) { return y(d.count); })

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));
};
