function findIndicesOfMax(inp, count) {
  var outp = [];
  for (var i = 0; i < inp.length; i++) {
      outp.push(i); // add index to output array
      if (outp.length > count) {
          outp.sort(function(a, b) { return inp[b] - inp[a]; }); // descending sort the output array
          outp.pop(); // remove the last index (index of smallest element in output array)
      }
  }
  return outp;
}

function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  console.log("url:"+url);
  d3.json(url).then(function(data){
    // Use d3 to select the panel with id of `#sample-metadata`
    var mydiv = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    mydiv.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(data).forEach(([key, value]) => {
      // Log the key and value
      var row = mydiv.append("tr");
      var cell1 = row.append("td");
      cell1.text(key+": ");
      var cell2 = row.append("td");
      cell2.text(value);

      console.log(`Key: ${key} and Value ${value}`);
    });

    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });



}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`;
  console.log("url:"+url);
  d3.json(url).then(function(data){

    // Build a Bubble Chart using the sample data
    var trace1 = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        color: data.otu_ids,
        size: data.sample_values
      }
    };

    var bubble_data = [trace1];

    var bubble_layout = {
      title: '<b>Sample Microbial "Species"</b>',
      xaxis: {
        title: 'OTU ID'
      },
      showlegend: false,
      height: 500,
      width: 1400
    };

    Plotly.newPlot('bubble', bubble_data, bubble_layout);

    // Build a Pie Chart using the sample data
    var pie_layout = {
      showlegend: true,
      title: '<b>Top 10 Microbes</b> <br> for this sample'
    };
    
    // Call findIndicesOfMax function to return a list of the top ten indexes
    var indices = findIndicesOfMax(data.sample_values, 10);
    console.log("INDICES:"+indices);
    var sorted_values = [];
    var sorted_otu_ids = [];
    var sorted_otu_labels = [];
    indices.forEach(function(i){
      sorted_values.push((data.sample_values[i]));
      sorted_otu_ids.push((data.otu_ids[i]));
      sorted_otu_labels.push((data.otu_labels[i]));
    });

    console.log("Lengend: "+sorted_otu_ids);
    console.log("Labels: "+ sorted_otu_labels);
    
    var trace2 = {
        "labels": sorted_otu_ids,
        "values": sorted_values,
        "hovertext": sorted_otu_labels,
        "hoverInfo": "text",
        "type": "pie"};

    var pie_data = [trace2];

    Plotly.newPlot("pie", pie_data, pie_layout);
    
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
