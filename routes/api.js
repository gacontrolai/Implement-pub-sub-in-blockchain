var express = require("express");
var router = express.Router();
var mysql = require("mysql");

require("dotenv").config();

var con = mysql.createConnection({
	host: "localhost",
	user: process.env.DATABASEUSER,
	password: process.env.DATABASEPASS,
	database: process.env.DATABASENAME,
});

con.connect(function (err) {
	if (err) throw err;
	console.log(`Connected to ${process.env.DATABASENAME}`);
});

/* GET users listing. */
router.post("/store_device", function (req, res, next) {
	res.send("respond with a resource");
});

module.exports = router;
