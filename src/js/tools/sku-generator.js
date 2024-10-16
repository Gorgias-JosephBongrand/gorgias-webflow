// Add event listener to button click to generate SKUs
document.getElementById('form-button-start-generating-skus').onclick = function (e) {
    e.preventDefault(); // Prevent default form submission behavior if it's within a form
  
    // Display the template-policy element
    $('#template-policy').css('display', 'block'); 
    console.log('sku generator displayed');
  
    // Capture the email from the input field
    var email = document.getElementById("form-cta-top-email").value;
  
    // Send an analytics tracking event for 'Tool Interaction Made'
//     if (window.analytics) {
//       analytics.track('Tool Interaction Made', {
//         interaction: 'Start Generating SKUs',
//         parameter: 'email: ' + email,
//         url: window.location.href,
//       });
//     } else {
//       console.error("Analytics is not defined.");
//     }
//   };

  // Function to generate the SKU based on inputs
function getSku(type, name, att1, att2, att3) {
    var sku = type.slice(0, 3).toUpperCase() + "/" + 
              name.slice(0, 2).toUpperCase() + "-" + 
              att1.slice(0, 2).toUpperCase() + 
              att2.slice(0, 2).toUpperCase() + 
              att3.slice(0, 2).toUpperCase();
    return sku;
}

// Initialize Tabulator
var table = new Tabulator("#sku-table", {
    height: "100%",
    addRowPos: "top",
    pagination: "local",
    paginationSize: 8,
    columns: [
        {title: "Product Type", field: "product_type", editor: "input"},
        {title: "Product Name", field: "product_name", editor: "input"},
        {title: "Attribute 1", field: "attribute_1", editor: "input"},
        {title: "Attribute 2", field: "attribute_2", editor: "input"},
        {title: "Attribute 3", field: "attribute_3", editor: "input"},
        {title: "SKU", field: "sku", editor: "input", editable: false},
        {title: "", formatter: "buttonCross", align: "center", cellClick: function(e, cell) {
            cell.getRow().delete();
        }}
    ],
    cellEdited: function(cell) {
        var rowData = cell.getRow().getData();
        var sku = getSku(rowData.product_type, rowData.product_name, rowData.attribute_1, rowData.attribute_2, rowData.attribute_3);
        cell.getRow().update({sku: sku});
    }
});

// Add row to the table
$("#add-row").click(function() {
    var productType = $("#field-product-type").val();
    var productName = $("#field-product-name").val();
    var attribute1 = $("#field-attribute-1").val();
    var attribute2 = $("#field-attribute-2").val();
    var attribute3 = $("#field-attribute-3").val();
    var sku = getSku(productType, productName, attribute1, attribute2, attribute3);

    table.addRow({
        product_type: productType,
        product_name: productName,
        attribute_1: attribute1,
        attribute_2: attribute2,
        attribute_3: attribute3,
        sku: sku
    });
});

// Delete the first row in the table
$("#del-row").click(function() {
    table.deleteRow(1);
});

// Clear the table
$("#clear").click(function() {
    table.clearData();
});

// Download data as CSV
$("#download-csv").click(function() {
    table.download("csv", "data.csv");
});

// Download data as JSON
$("#download-json").click(function() {
    table.download("json", "data.json");
});

// Download data as XLSX
$("#download-xlsx").click(function() {
    table.download("xlsx", "data.xlsx", {sheetName: "My Data"});
});

// Download data as PDF
$("#download-pdf").click(function() {
    table.download("pdf", "data.pdf", {
        orientation: "portrait",
        title: "SKU Report"
    });
});
}