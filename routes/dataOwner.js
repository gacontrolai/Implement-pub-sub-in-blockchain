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

router.post("/uploadfile", upload.single("file"), async (req, res, next) => {
	const file = req.file;
	console.log("req: ", req.body);
	console.log("req: ", req.file);
	// generate asyn key for data packet
	let getpass = new Promise((resolve, reject) => {
		con.query(`select password from account where account_ID = ${req.session.userID}`, (err, result) => {
			return err ? reject(err) : resolve(result);
		});
	});
	password = await getpass;
	if (!bcrypt.compareSync(req.body.password, password[0].password)) {
		console.log("wrong pass");
		return res.status(401).send("Wrong password");
	}
	let key = PRE.Proxy.generate_key_pair();
	var dataSk = PRE.Proxy.to_hex(key.get_private_key().to_bytes());
	var dataPk = PRE.Proxy.to_hex(key.get_public_key().to_bytes());
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}
	// encrypt file with data pk
	let rawdata = fs.readFileSync(file.path);
	fs.rmSync(file.path);
	console.log(file.path);
	// let student = JSON.parse(rawdata);
	let strData = rawdata.toString();
	console.log(strData);
	let obj = PRE.encryptData(dataPk, strData);
	console.log("----------");
	console.log(JSON.stringify(obj));
	// upload encrpyted data to ipfs
	const dataCID = await addFiles(JSON.stringify(obj));
	// get subscriber and generate rek
	var listSubscriber = await getSubscriber(req.body.deviceID, req.body.from, req.body.to);
	console.log("list Sub: ", listSubscriber);
	var listOfRek = [];
	let userSk = AES.decrypt(req.session.sk, req.body.password).toString(enc.Utf8);
	listSubscriber.forEach((element) => {
		let rek = PRE.generateReEncrytionKey(dataSk, element.public_key);
		listOfRek.push({ address: element.bc_address, rek: rek });
	});
	// upload to ipfs
	let encryptedDataSk = AES.encrypt(dataSk, req.body.password).toString();
	const rekCID = await addFiles(JSON.stringify(listOfRek, "/n", 2));
	console.log(dataCID);
	res.send({ data: dataCID, pk: dataPk, sk: encryptedDataSk, rek: rekCID });
});

router.post("/store_package", (req, res) => {
	value = [[req.body.dataID, req.body.deviceID, req.body.sk, req.body.pk, req.body.start, req.body.end, req.body.dataUri, req.body.rekUri]];
	var strorePackage = "Insert into data_packet values ? ";
	con.query(strorePackage, [value], (err, result) => {
		if (err) {
			throw err;
		}
		console.log("Storign packet: ", result);
		res.status(200).send("Success");
	});
});

const addFiles = async (data) => {
	const fileAdd = await ipfs.add({ content: data });

	console.log(fileAdd);
	const hash = fileAdd.path;
	return hash;
};

async function getfile(CID) {
	ipfs.get();
}

router.post("/get_subscriber", async (req, res) => {
	var listSubscriber = await getSubscriber(req.body.deviceID, req.body.from, req.body.to);
	console.log("sub: ", listSubscriber);
	res.send(listSubscriber);
});

function getSubscriber(deviceID, from, to) {
	var getSub = `select bc_address, du_id_fk, start_day, end_day, public_key from register, account where account_ID = du_id_fk and device_id_fk = "${deviceID}" and start_day <= ${from} and end_day >= ${to}`;
	console.log("query for subscriber: ", getSub);
	return new Promise((resolve, reject) => {
		con.query(getSub, (err, result) => {
			return err ? reject(err) : resolve(result);
		});
	});
}

async function getpk(bcAddress) {
	var getSub = `select public_key from account where account_ID = ${bcAddress} `;
	console.log("query for subscriber: ", getSub);
	return new Promise((resolve, reject) => {
		con.query(getSub, (err, result) => {
			return err ? reject(err) : resolve(result);
		});
	});
}

function getBcAddress(userID) {
	var getSub = `select bc_address from account where account_ID = ${userID} `;
	console.log("query for subscriber: ", getSub);
	return new Promise((resolve, reject) => {
		con.query(getSub, (err, result) => {
			return err ? reject(err) : resolve(result);
		});
	});
}

function bytes32ToString(inputBytes) {
	return web3.utils.hexToUtf8(inputBytes);
}

router.get("/register_device", checkDataOwner, (req, res) => {
	res.render("do/register_device.ejs");
});

router.get("/my_devices", (req, res) => {
	res.render("do/my_devices");
});
router.get("/list_subscriber", (req, res) => {
	res.render("do/list_subscriber");
});

router.get("/publish_data", checkDataOwner, (req, res) => {
	console.log("./devie_data:id");
	res.render("do/publish_data.ejs", { deviceID: req.query.deviceID });
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

router.get("/view_transaction_need_update", checkDataOwner, (req, res) => {
	res.render("do/view_transaction_need_update.ejs", { deviceID: req.query.deviceID });
});

router.get("/update_key", checkDataOwner, (req, res) => {
	res.render("do/update_key.ejs", { trans: req.query.txID });
});

router.post("/transaction_need_update", (req, res) => {
	con.query(
		"select start_day, end_day, device_id, trans_id, bc_address,price from (register join device on device_id_fk = device_id) join account on account_ID  = du_id_fk where is_updated = 0 and dataOwner_id_mk = ?",
		[req.session.userID],
		(err, result) => {
			res.send(result);
		}
	);
});

router.post("/data_need_update", (req, res) => {
	con.query("select * from register where trans_id = ?", req.body.txID, (err, trans) => {
		console.log(trans);
		if (trans.length == 0) {
			return res.status(400).send("txID not found");
		}
		if (err) {
			return res.status(400).send(err);
		}
		tran = trans[0];
		if (tran.subscribe_time > tran.end_day) {
			end = tran.end_day;
		} else {
			end = tran.subscribe_time;
		}
		con.query("select * from data_packet where device_id_mk = ? and start_day >= ? and end_day <= ? ", [tran.device_id_fk, tran.start_day, end], (err, result) => {
			if (trans.length == 0) {
				return res.status(400).send("No packet match");
			}
			if (err) {
				return res.status(400).send(err);
			}
			res.send(result);
			console.log(result);
		});
	});
});

router.post("/update_key", async (req, res) => {
	// con.query("select * from data_paket where device_id_mk = ? and start_day >= ? and en_day <= ? ", [req.body.deviceID, req.body.from, req.body.reqTime], async (err, result) => {
	// 	listOfRek = [];
	// 	DUpk = getpk(req.body.address);
	// 	result.forEach((data) => {
	// 		dataSk = AES.decrypt(data.private_key, req.body.password).toString(enc.Utf8);
	// 		let rek = PRE.generateReEncrytionKey(dataSk, DUpk);
	// 		listOfRek.push({ dataID: data.device_id_mk, rek: rek });
	// 	});
	// 	const rekCID = await addFiles(JSON.stringify(listOfRek, "/n", 2));
	// 	res.send(rekCID);
	// });

	con.query("select * from register where trans_id = ?", req.body.txID, async (err, trans) => {
		console.log(trans);
		if (trans.length == 0) {
			return res.status(400).send("txID not found");
		}
		if (err) {
			return res.status(400).send(err);
		}
		tran = trans[0];
		if (tran.subscribe_time > tran.end_day) {
			end = tran.end_day;
		} else {
			end = tran.subscribe_time;
		}
		let DUpk = (await getpk(tran.du_id_fk))[0].public_key;
		console.log(DUpk);
		listOfRek = [];
		con.query("select * from data_packet where device_id_mk = ? and start_day >= ? and end_day <= ? ", [tran.device_id_fk, tran.start_day, end], async (err, result) => {
			if (trans.length == 0) {
				return res.status(400).send("No packet match");
			}
			if (err) {
				return res.status(400).send(err);
			}
			result.forEach((data) => {
				dataSk = AES.decrypt(data.private_key, req.body.password).toString(enc.Utf8);
				let rek = PRE.generateReEncrytionKey(dataSk, DUpk);
				listOfRek.push({ dataID: data.data_id, rek: rek });
			});
			const rekCID = await addFiles(JSON.stringify(listOfRek, "/n", 2));
			console.log(listOfRek);
			duAddress = (await getBcAddress(tran.du_id_fk))[0].bc_address;
			res.json({ rek: rekCID, txID: req.body.txID, to: duAddress, deviceID: tran.device_id_fk });
		});
	});
});

module.exports = router;
