function init() {
    var selector = d3.select("#selDataset");
  
    d3.json("samples.json").then((data) => {
      console.log(data);
      var sampleNames = data.names;
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
})}
  
init();
buildMetadata(940);
buildCharts(940);


function optionChanged(newSample) {
    buildMetadata(newSample);
    buildCharts(newSample);
}

function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
      var metadata = data.metadata;

      // Extract Metadat info for each selected candidate
      var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);  

      var PANEL = d3.select("#sample-metadata");
      
      PANEL.html("");

      // Print candidate Metadat info in the panel on webpage
      Object.entries(resultArray[0]).forEach(([key, value]) =>
      {
        PANEL.append("h6").text(key + ': ' + value);
        });
      
    });
}

function buildCharts(sample) {
    d3.json("samples.json").then((data) => {

      // Extract Samples info for each selected candidate
      var samplesArray = data.samples.filter(sampleObj => sampleObj.id == sample); 

      // Extract WFreq for the candidate for the guage chart
      var metaArray = data.metadata.filter(sampleObj => sampleObj.id == sample);  
      var wkly_freq=metaArray[0].wfreq;
   
      // Extract OTU ID array for the candidate selected
      var sample_otu=samplesArray[0].otu_ids;
      // Extract array of Sample Values for the candidate selected
      var sample_num=samplesArray[0].sample_values;
      // Extract array of OTU Labels for the candidate selected
      var labels=samplesArray[0].otu_labels;

      // Create array for sorting and slicing top 10 samples
      var result = [];
      sample_otu.forEach((key, i) => result.push([key, sample_num[i], labels[i]]));

      // Sort the OTUs by sample size
      var sortedSamples = result.sort((a,b) => b[1] - a[1]); 

     // The next step is to select only the top ten OTUs by sample size
     var topTen = sortedSamples.slice(0,10);

     var x_axis=[];
     var y_axis=[];
     var top_labels=[];

     Object.entries(topTen).forEach(([key, value]) =>
     {
        x_axis.push('OTU '+value[0]);
        y_axis.push(value[1]);
        top_labels.push(value[2]);

     });

     // Plot the bar chart
     var trace = {
        x: y_axis.reverse(),
        y: x_axis.reverse(),
        text: top_labels.reverse(),
        orientation: 'h',
        marker: {
        color: 'rgba(146,208,80,1.0)'
        },
        type: "bar"
      };

      var layout = {
        title: {
            text: "<b>Top 10 Samples</b>",
            font: {
                family: 'Verdana',
                size: 24
              },
            }
      }

      Plotly.newPlot("bar", [trace], layout);

      // BUBBLE CHART

      var trace1 = {
        x: sample_otu,
        y: sample_num,
        text: labels,
        mode: 'markers',
        marker: {
          size: sample_num,
          color: sample_otu,
          sizeref: 2,
          colorscale: 'YIGnBu'
        },
        type: "scatter"
      }

      var layout1 = {
        showlegend: false,
        plot_bgcolor:"#edf0f2",
        paper_bgcolor:"white",
        height: 600,
        width: 1100,
        title: {
            text: "<b>Sample size by OTU for candidate id: </b>" + sample,
            font: {
                family: 'Verdana',
                size: 24
              }
        },
    
        xaxis: {
          zeroline: false,
          title: "<b>OTU ID</b>",
          font: {
            family: 'Verdana',
            size: 18,
            color: '#7f7f7f'
          },
          gridcolor: 'white',
        },
        yaxis: {
          rangemode: 'nonnegative',
          zeroline: false,
          title: "<b># of samples</b>",
          font: {
            family: 'Verdana',
            size: 18,
            color: '#7f7f7f'
          },
          gridcolor: 'white',
        }
     };
    
     Plotly.newPlot("bubble", [trace1], layout1);

     // Create a guage chart for weekly wash frequency
      var trace2 = {
            value: wkly_freq,
            title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week" },
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis: { range: [0, 9], tickwidth: 1, tickcolor: "darkblue" },
                bar: { color: "darkblue" },
                bgcolor: "white",
                borderwidth: 2,
                bordercolor: "gray",
                steps: [
                  { range: [0, 5], color: "cyan" },
                  { range: [5, 9], color: "royalblue" }
                ],
              },
              
        };
    
        var layout2 = {
            width: 460,
            height: 380,
            margin: { t: 25, r: 25, l: 25, b: 25 },
            paper_bgcolor: "lavender",
            font: { color: "darkblue", family: "Verdana" }
          };
      
      Plotly.newPlot('gauge', [trace2], layout2);



    });
}