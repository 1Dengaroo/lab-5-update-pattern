"use strict";

const PATH = "assets/coffee-house-chains.csv";
const MARGIN = { top: 30, right: 30, bottom: 20, left: 75 };
const WIDTH = 650 - MARGIN.left - MARGIN.right,
  HEIGHT = 500 - MARGIN.top - MARGIN.bottom;

// CHART INIT ----------------------------
const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", WIDTH + MARGIN.left + MARGIN.right)
  .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
  .append("g")
  .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

// Create scales
const xScale = d3.scaleBand().rangeRound([0, WIDTH]).paddingInner(0.1);

const yScale = d3.scaleLinear().range([HEIGHT, 0]);

// Create axis scales
const xAxis = d3.axisBottom().scale(xScale);
const yAxis = d3.axisLeft().scale(yScale);

// Create axis containers
const xGroup = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${HEIGHT})`);

const yGroup = svg.append("g").attr("class", "y-axis");

const label = svg
  .append("text")
  .attr("class", "y_label")
  .attr("text-anchor", "end")
  .attr("x", 0)
  .attr("y", -12);

let type = d3.select("#group-by").node().value;
let direction = d3.select("#sort").node().value; // for sorting

function update(data, type) {
  console.log("UPDATING: ", type);
  xScale.domain(data.map((d) => d.company));
  yScale.domain([0, d3.max(data, (d) => d[type])]);

  // Transition (NO DELAY)
  const t = svg.transition().duration(2000);

  // RENDER BAR CHART
  const bars = svg.selectAll("rect").data(data, (d) => d.company);

  // Enter
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.company))
    .attr("y", (d) => yScale(d[type]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => HEIGHT - yScale(d[type]))
    .style("fill", "steelblue");

  // Update
  bars.call((update) =>
    update
      .transition(t)
      .attr("height", (d) => HEIGHT - yScale(d[type]))
      .attr("x", (d) => xScale(d.company))
      .style("fill", "steelblue")
      .attr("y", (d) => yScale(d[type]))
  );

  // Exit
  bars.exit().remove();

  //  Render axes and title
  xGroup.transition(t).call(xAxis).attr("transform", `translate(0, ${HEIGHT})`);

  yGroup.transition(t).call(yAxis);

  // Capitalize first letter
  label.text(type.charAt(0).toUpperCase() + type.slice(1));
}

function sort(data, type, change = true) {
  if (change) {
    direction *= -1;
    d3.select("#sort").property("value", direction);
  }
  if (direction > 0) {
    data.sort((a, b) => a[type] - b[type]);
  } else {
    data.sort((a, b) => b[type] - a[type]);
  }
}

d3.csv(PATH, d3.autoType).then((data) => {
  // Dropdown update listener
  d3.select("#group-by").on("change", () => {
    type = d3.select("#group-by").node().value;
    sort(data, type, false);
    update(data, type);
  });

  // Sort button listener
  d3.select("#sort").on("click", () => {
    sort(data, type);
    update(data, type);
  });

  // Render initial bar chart
  sort(data, type);
  update(data, type);
});
