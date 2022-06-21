var mysql = require("mysql");
var fs = require("fs");

var init_str = fs.readFileSync("init_db.sql").toString();

require("dotenv").config();

var con = mysql.createConnection({
	host: "localhost",
	user: process.env.DATABASEUSER,
	password: process.env.DATABASEPASS,
	database: process.env.DATABASENAME,
	multipleStatements: true,
});

con.connect(function (err) {
	if (err) throw err;
	console.log(init_str);
	console.log("Connected!");
	con.query(init_str, function (err, result) {
		if (err) throw err;
		console.log("Database created");
		process.exit(1);
	});
});
