var mysql = require("mysql");
var Web3 = require("web3");
web3 = new Web3("ws://localhost:7545");
console.log(web3);

require("dotenv").config();

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: process.env.DATABASEPASS,
	database: process.env.DATABASENAME,
});

con.connect(function (err) {
	if (err) throw err;
	console.log(`Connected to ${process.env.DATABASENAME}`);
});
