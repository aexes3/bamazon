var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

//establish connection
var connection = mysql.createConnection({
    host:       'localHost',
    user:       'root',
    port:       '3306',
    database:   'bamazon',
    password:   'Faster45'
});
//check to see if connection is successful
connection.connect(function(err){
    if(err) throw err;
    //console.log("connection id is", connection.threadId);
    console.log("\n" + "Welcome to our Electronics Store!");
    ourProducts();
});

function ourProducts(){
// instantiate
connection.query("SELECT * FROM products", function(err, res){
    if(err) throw err;
    var table = new Table({
        head: ['Id:', 'Product:', 'Price:', 'Quantity:']
      , colWidths: [5, 20, 20, 20,]
    });
     
    for(let i = 0; i < res.length; i++){
        table.push(
            [res[i].item_id,
            res[i].product_name,
            res[i].price,
            res[i].stock_quantity]
        );
    }//completes for loop
     
    console.log(table.toString() + '\n');
    orderingPrompt();
}) //ends connection.query();
} //closes ourProducts();

function orderingPrompt(){
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "What item ID would you like to purchase?",
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log("\n" + " Please enter Item Id #:" + "\n");
                return false;
            }
        }
    },
    {  
        name: "amount",
        type: "input",
        message: "How many would you like to buy?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
        }
    }]).then(function(userSelection){
        //connects to db, updates table
        var id = userSelection.item;
        var orderingStock = userSelection.amount;
    connection.query("SELECT * FROM products WHERE ?", {item_id: id}, function(err, res){
        var availableStock = res[0].stock_orderingStock;
        var iPrice = res[0].price;
        var tPrice = orderingStock * iPrice;
        //console.log('user Selection', userSelection);
        //console.log('Poruduct id', id);
        //console.log('orderingStock', orderingStock);
        //console.log('Price', res[0].price);
        //console.log('Total Price:', orderingStock * iPrice);
        if (err) throw err;
        if(orderingStock > availableStock){
            console.log(`\nSorry, I've only got ${availableStock}. Try again with a smaller orderingStock.\n`);
            orderingPrompt();
        }
        else {
            connection.query("UPDATE products SET ? WHERE ?", 
           [{
               stock_quantity: availableStock - orderingStock
           },
           {
               item_id: id            
            }], 
            function (err) {
                // if(err) throw err;
                if (orderingStock == 1){
                    console.log(`You purchased ${orderingStock} of ${res[0].product_name} for a total of $${tPrice}.`)
                }
                else{
                    console.log(`You purchased ${orderingStock} ${res[0].product_name}s for a total of $${tPrice}.`)
                }
            }
            )
        }
        
        
    })
    }); //ends .then function

    //connection.end();
} //closes orderingPrompt();