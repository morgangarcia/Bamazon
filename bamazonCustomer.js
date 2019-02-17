// Require prompt node package 
const inquirer= require('inquirer');

// Require mySQL node package
const mysql = require('mysql');




// Link to mySQL Database
const connection = mysql.createConnection({
    host: "localhost",
    port: 127.0.0.1
    user: "root", //Your username
    password: "", //Your password
    database: "bamazon"
});

// Connect to Database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});



// Display All Items inside Database and sell an item to customer
connection.query('SELECT * FROM Products', function(err, res){
  
  // Error Handler
  if(err) throw err;


  // Show User message
  console.log('Check out our selection...\n');

  // Set up table header
  console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
  
  // Loop through database and show all items
  for(var i = 0; i < res.length; i++){

    

    // Log table entry
    console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
  }

  // =================================================================================================

  // After the table is shown, ask the user to buy something
  prompt.start();

  // Ask for Item ID
  console.log('\nWhich item do you want to buy?');
  prompt.get(['buyItemID'], function (err, result) {
    
    // Show Item ID selected
    var buyItemID = result.buyItemID;
    console.log('You selected Item # ' + buyItemID + '.');

    // Then ask for Quanity (once user completed first entry)
    console.log('\nHow many do you wish to buy?')
    prompt.get(['buyItemQuantity'], function (err, result) {

      // Show quantity selected
      var buyItemQuantity = result.buyItemQuantity;
      console.log('You selected to buy ' + buyItemQuantity + ' of these.');

      // Once the customer has placed the order, check if store has enough of the product to meet the request
      connection.query('SELECT StockQuantity FROM Products WHERE ?', [{ItemID: buyItemID}], function(err, res){
        if(err) throw err; // Error Handler
        // Check if the item Id was valid (i.e. something was returned from mySQL)
        if(res[0] == undefined){
          console.log('Sorry... We found no items with Item ID "' +  buyItemID + '"');
          connection.end(); // end the script/connection
        }
        // Valid Item ID, so compare Bamazon Inventory with user quantity 
        else{
          const bamazonQuantity = res[0].StockQuantity;
          // Sufficient inventory
          if(bamazonQuantity >= buyItemQuantity){

            // Update mySQL database with reduced inventory
            const newInventory = parseInt(bamazonQuantity) - parseInt(buyItemQuantity); // ensure we have integers for subtraction & database
            connection.query('UPDATE Products SET ? WHERE ?', [{StockQuantity: newInventory}, {ItemID: buyItemID}], function(err, res){
              if(err) throw err; // Error Handler
            }); // end inventory update query


            // Show customer their purchase total (need to query the price info from database)
            const customerTotal;
            connection.query('SELECT Price FROM Products WHERE ?', [{ItemID: buyItemID}], function(err, res){
              
              const buyItemPrice = res[0].Price;
              customerTotal = buyItemQuantity*buyItemPrice.toFixed(2);

              console.log('\nYour total is $' + customerTotal + '.');

              // ------------------------- Re factor for Executive Challenge ------------------------
              // Find the department for the purchase item
              connection.query('SELECT DepartmentName FROM Products WHERE ?', [{ItemID: buyItemID}], function(err, res){
                const itemDepartment = res[0].DepartmentName;
                
                // Find the current Revenue for that department
                connection.query('SELECT TotalSales FROM Departments WHERE ?', [{DepartmentName: itemDepartment}], function(err, res){
                  const totalSales = res[0].TotalSales;

                  // Calculate new sale revenue
                  const totalSales = parseFloat(totalSales) + parseFloat(customerTotal);

                  // Add the revenue from each transaction to the TotalSales column for the related department.
                  connection.query('UPDATE Departments SET ? WHERE ?', [{TotalSales: totalSales}, {DepartmentName: itemDepartment}], function(err, res){
                    if(err) throw err; // Error Handler
                    console.log('Transaction Completed. Thank you!')
                    connection.end(); // end the script/connection

                  }); // end new revenue update query
      
                }); // end current revenue query

              }); // end department name query 
              // -------------------------------------------------------------------------------------
            }); // end customer purchase update query 
          }
          // Insufficient inventory
          else{
            console.log('Sorry... We only have ' +  bamazonQuantity + ' of those items. Order cancelled.');
            connection.end(); // end the script/connection
          }
        }

      }); // end item quantity query

    }); // end of prompt 2

  }); // end of prompt 1

}); // end of main query
