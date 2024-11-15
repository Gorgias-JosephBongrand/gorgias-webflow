function replaceTextWithDataName() {
  // Select the element with the data-name attribute
  const element = document.querySelector('[data-name]');
  
  // Check if the element exists
  if (element) {
    // Get the value of the data-name attribute
    const dataNameValue = element.getAttribute('data-name');
    
    // Replace the current text content with the data-name value
    element.textContent = dataNameValue;
    
    // Log for debugging
    console.log(`Replaced text with data-name value: ${dataNameValue}`);
  } else {
    console.warn("No element found with the data-name attribute.");
  }
}

// Run the function
replaceTextWithDataName();

// ========================================
// Global Constants and Utility Functions
// ========================================

const colorPalette = {
  Positive: '#289e43', // Green for positive sentiment
  Neutral: '#afafaf',  // Gray for neutral sentiment
  Negative: '#ff9780', // Red for negative sentiment
  RatingColors: ['#ff9780', '#289e43', '#cb55ef', '#cedeff', '#fee0ca', '#afafaf'],
  ReviewScoreColors: ['#ff9780', '#289e43', '#cb55ef', '#cedeff', '#fee0ca', '#afafaf', 
                      '#ffe680', '#a3d2ff', '#a1ef9d', '#f29d9a', '#fdc066', '#c0c0c0'],
  ComparisonColors: ['#ff9780', '#4a4a4a'] // Colors for Company and Industry bars
};

/**
 * Parses JSON data from an HTML element with a specified selector.
 * @param {string} selector - The CSS selector for the target element.
 * @returns {Object|null} - The parsed JSON object, or null if the element is not found.
 */
function parseJSONFromElement(selector) {
  const element = document.querySelector(selector);
  return element ? JSON.parse(element.textContent) : null;
}


// ========================================
// Chart Creation Function
// ========================================

/**
 * Dynamically creates a Chart.js chart based on JSON data and configuration options.
 * @param {string} selector - The CSS selector of the element containing JSON data.
 * @param {string} chartElementId - The ID of the canvas element where the chart will be rendered.
 * @param {string} chartType - The type of chart to create (e.g., 'doughnut', 'bar', 'pie').
 * @param {Object} options - Additional options to customize the chart.
 */
function createChartFromData(selector, chartElementId, chartType, options = {}) {
  const dataObject = parseJSONFromElement(selector);
  if (!dataObject) {
    console.warn(`Data not found for selector: ${selector}`);
    return;
  }

  // Initialize variables for labels and datasets
  let labels = [];
  let datasets = [];

  // Dynamically structure data based on chart type and JSON properties
  if (chartType === 'doughnut' && dataObject.ratings) {
    // Doughnut chart for ratings distribution
    labels = Object.keys(dataObject.ratings);
    datasets = [{
      label: options.label || 'Distribution',
      data: Object.values(dataObject.ratings),
      backgroundColor: colorPalette.RatingColors.slice(0, labels.length),
      borderWidth: 1
    }];
  } 
  else if (chartType === 'bar' && Array.isArray(dataObject.sentiment)) {
    // Stacked bar chart for sentiment analysis over years
    labels = dataObject.sentiment.map(entry => entry.Year);
    datasets = [
      {
        label: 'Positive',
        data: dataObject.sentiment.map(entry => entry.Positive),
        backgroundColor: colorPalette.Positive,
        borderWidth: 1
      },
      {
        label: 'Neutral',
        data: dataObject.sentiment.map(entry => entry.Neutral),
        backgroundColor: colorPalette.Neutral,
        borderWidth: 1
      },
      {
        label: 'Negative',
        data: dataObject.sentiment.map(entry => entry.Negative),
        backgroundColor: colorPalette.Negative,
        borderWidth: 1
      }
    ];
  } 
  else if (chartType === 'pie' && dataObject.scores) {
    // Pie chart for review scores
    labels = dataObject.scores.map(item => item.review_score.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()));
    datasets = [{
      label: options.label || 'Average Overall Scores',
      data: dataObject.scores.map(item => item.avg_overall_score),
      backgroundColor: colorPalette.ReviewScoreColors.slice(0, labels.length),
      borderWidth: 1
    }];
  } 
  else if (chartType === 'bar' && dataObject.categories && dataObject.datasets) {
    // Bar chart for company vs. industry comparison
    labels = dataObject.categories;
    datasets = dataObject.datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: colorPalette.ComparisonColors[index % colorPalette.ComparisonColors.length],
      borderWidth: 1
    }));
  } 
  else {
    console.warn(`Unrecognized data structure or unsupported chart type: ${chartType}`);
    return;
  }

  // Configure the chart data for Chart.js
  const chartData = { labels, datasets };

  // Find the canvas context and initialize the chart
  const ctx = document.getElementById(chartElementId);
  if (!ctx) {
    console.warn(`Canvas element with ID '${chartElementId}' not found.`);
    return;
  }

  // Define chart options, conditionally hiding grid and axis for doughnut and pie charts
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: options.legendPosition || 'right'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}${options.valueSuffix || ''}`;
          }
        }
      },
      title: {
        display: !!dataObject.title,
        text: dataObject.title
      }
    },
    scales: (chartType === 'doughnut' || chartType === 'pie') ? {} : { // Hide axes for doughnut and pie charts
      x: {
        title: {
          display: false // No "Categories" label
        },
        grid: {
          display: true
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rating'
        },
        grid: {
          display: true
        }
      }
    }
  };

  // Create the Chart.js instance with provided configuration
  new Chart(ctx.getContext('2d'), {
    type: chartType,
    data: chartData,
    options: chartOptions
  });

  console.log(`Chart of type '${chartType}' initialized successfully in element: ${chartElementId}`);
}


// ========================================
// Master Initialization Function
// ========================================

function initializeCharts() {
  // Rating Doughnut Chart
  createChartFromData('[data-el="rating"]', 'myChart', 'doughnut', {
    label: 'Ratings Distribution',
    showLegend: true
  });
  
  // Sentiment Stacked Bar Chart
  createChartFromData('[data-el="sentiment"]', 'myChart2', 'bar', {
    label: 'Sentiment Over Time',
    legendPosition: 'right',
    valueSuffix: '%',
    scales: {
      x: { stacked: true },
      y: { beginAtZero: true, stacked: true, ticks: { callback: value => value + '%' } }
    }
  });
  
  // Review Score Pie Chart
  createChartFromData('[data-el="review-scores"]', 'myChart3', 'pie', {
    label: 'Review Score Distribution',
    showLegend: true
  });
  
  // Company vs Industry Comparison Bar Chart for myChart4
  createChartFromData('[data-el="company-industry-comparison"]', 'myChart4', 'bar', {
    showLegend: true,
    legendPosition: 'right'
  });
}

// Initialize charts once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCharts);