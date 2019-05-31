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

// function buildGauge(freq) {
//   // Multiply frequency by 20 since 9 is a multiple of 180 
//   var level = freq*20;
//   console.log("building gauge: " + freq);

//   // Trig to calc meter point
//   var degrees = 180 - level,
//   radius = .5;
//   var radians = degrees * Math.PI / 180;
//   var x = radius * Math.cos(radians);
//   var y = radius * Math.sin(radians);
//   console.log("x:"+x);
//   console.log("y:"+y);

//   // Path: may have to change to create a better triangle
//   var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
//   pathX = String(x),
//   space = ' ',
//   pathY = String(y),
//   pathEnd = ' Z';
//   var path = mainPath.concat(pathX,space,pathY,pathEnd);

//   var data = [{ 
//     type: 'scatter',
//     x:[0], 
//     y:[0],
//     marker: {size: 28, color:'850000'},
//     showlegend: false,
//     name: 'speed',
//     next: level},
//       // hoverinfo: 'text+name'},
//     { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
//     rotation: 90,
//     text: ['8-9', '7-8', '6-7', '5-6',
//               '4-5', '3-4', '2-3', '1-2', '0-1'],
//     textinfo: 'text',
//     textposition:'inside',
//     marker: {colors:[ 'rgba(14, 127, 0, .75)', 'rgba(14, 127, 0, .65)', 'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .55)',
//                           'rgba(110, 154, 22, .45)', 'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
//                           'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
//                           'rgba(255, 255, 255, 0)']},
//     // labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
//     // hoverinfo: 'label',
//     hole: .5,
//     type: 'pie',
//     showlegend: false
//   }];

//   var layout = {
//     shapes:[{
//         type: 'path',
//         path: path,
//         fillcolor: '850000',
//         line: {
//           color: '850000'
//         }
//       }],
//     title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
//     height: 550,
//     width: 550,
//     xaxis: {zeroline:false, showticklabels:false,
//                showgrid: false, range: [-1, 1]},
//     yaxis: {zeroline:false, showticklabels:false,
//                showgrid: false, range: [-1, 1]}
//   };
  
//   Plotly.newPlot('gauge', data, layout);
// }

function buildMetadata(sample) {

  // This function that builds the metadata panel

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
    
    // var sorted_values = data.sample_values.sort(function(a, b){
    //   //somehow sort the other dictionary values to match this order!
    //   return (b - a)}
    // );

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
