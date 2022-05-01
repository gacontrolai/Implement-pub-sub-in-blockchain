var mysql = require("mysql");

require("dotenv").config();

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: process.env.DATABASEPASS,
	database: process.env.DATABASENAME,
	multipleStatements: true,
});
module.exports = con;
