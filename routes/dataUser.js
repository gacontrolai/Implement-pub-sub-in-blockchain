var express = require("express");
var router = express.Router();
var reencypt = require("../keyGen.js");
var multer = require("multer");
const fs = require("fs");
const PRE = require("recrypt-js");
const { stringify } = require("querystring");
const { create } = require("ipfs-http-client");
const bcrypt = require("bcrypt");
const { AES, enc } = require("crypto-js");
var { checkAuthenticate, checkDataOwner, checkDataUser } = require("../authorize");

const ipfs = create();

const con = require("../connectDB.js");

router.get("/showdevice", checkAuthenticate, (req, res) => {
	res.render("du/show_device.ejs");
});

router.get("/device_data", checkDataUser, (req, res) => {
	console.log("./devie_data:id");
	res.render("du/device_data.ejs", { deviceID: req.query.deviceID });
});

module.exports = router;
