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

// SET STORAGE
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now());
	},
});

var upload = multer({ storage: storage });

router.post("/uploadfile", upload.single("myFile"), async (req, res, next) => {
	const file = req.file;
	let pk_A = req.body.pk;
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}
	let rawdata = fs.readFileSync(file.path);
	console.log(file.path);
	// let student = JSON.parse(rawdata);
	let strData = rawdata.toString();
	console.log(strData);
	let obj = PRE.encryptData(pk_A, strData);
	console.log("----------");
	console.log(JSON.stringify(obj));

	const hash = await addFiles(JSON.stringify(obj));
	console.log(hash);
	res.send({ hash: hash, pk: pk_A });
});

const addFiles = async (data) => {
	const fileAdd = await ipfs.add({ content: data });

	console.log(fileAdd);
	const hash = fileAdd.path;
	return hash;
};

router.get("/register_device", checkDataOwner, (req, res) => {
	res.render("do/register_device.ejs");
});

router.get("/my_devices", (req, res) => {
	res.render("do/my_devices");
});

router.get("/publish_data", checkDataOwner, (req, res) => {
	console.log("./devie_data:id");
	res.render("du/device_data.ejs", { deviceID: req.query.deviceID });
});

router.post("/store_register_device", (req, res) => {
	console.log(req.body);
	let storeDevice = "insert into device(device_id,dataOwner_id_mk,price,description) values ?";
	let deviceInfo = [[req.body.deviceID, req.session.userID, Math.round(req.body.price * 10 ** 6), req.body.decribe]];
	con.query(storeDevice, [deviceInfo], (err, result) => {
		if (err) {
			throw err;
		}
		res.send(result);
		console.log(result);
	});
});

module.exports = router;
