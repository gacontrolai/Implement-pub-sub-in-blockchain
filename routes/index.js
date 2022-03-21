var express = require("express");
var router = express.Router();
var haha = require("../keyGen.js");
/* GET home page. */
router.get("/", function (req, res, next) {
	haha("Ai goi tui do");
	res.render("index", { title: "Express" });
});

module.exports = router;
