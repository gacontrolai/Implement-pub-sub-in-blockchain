var express = require("express");
var router = express.Router();
var reencypt = require("../keyGen.js");
var multer = require("multer");
const fs = require("fs");
const PRE = require("recrypt-js");
const PRE2 = require("bm-pre-x");
const { stringify } = require("querystring");
const { create } = require("ipfs-http-client");
const bcrypt = require("bcrypt");
const { AES, enc } = require("crypto-js");
var { checkAuthenticate, checkDataOwner, checkDataUser } = require("../authorize");

const ipfs = create();

const con = require("../connectDB.js");
const { route } = require("./dataOwner.js");

router.get("/showdevice", checkAuthenticate, (req, res) => {
	res.render("du/show_device.ejs");
});

router.get("/device_data", checkDataUser, (req, res) => {
	console.log(req.query.deviceID);
	res.render("du/device_data.ejs", { deviceID: req.query.deviceID });
});

async function listenPublish(cid) {
	contractInstance.events.Publish({ fromBlock: "latest" }).on("data", (event) => {});
}

async function getIpfs(CID) {
	for await (const buf of ipfs.cat(CID)) {
		return buf.toString();
	}
}

router.post("/check_subscribe", (req, res) => {
	let from = req.body.from;
	let to = req.body.to;
	let queystr = `select * from register where ((start_day < ${from} and end_day > ${from}) or (start_day < ${to} and end_day > ${to}) or (start_day >= ${from} and end_day <= ${to})) and device_id_fk = '${req.body.deviceID}'`;
	con.query(queystr, (err, result) => {
		if (err) {
			return res.status(400).send("Can't query the select time:" + err);
		}
		if (result.length == 0) {
			res.status(200).send("Success");
		} else {
			res.status(400).json(result);
		}
	});
});

router.get("/received_devices", (req, res) => {
	queryForAllDevice = `select distinct device_id_fk from register  where device_id_fk in (select device_id_mk from data_packet where data_id in (select data_id_fk from receive where dataUser_id_fk = ?))`;
	con.query(queryForAllDevice, req.session.userID, (err, result) => {
		if (err) {
			const error = new Error(err);
			error.httpStatusCode = 400;
			return next(error);
		}
		res.status(200).json(result.map((e) => e.device_id_fk));
	});
});

router.get("/receive_data", (req, res) => {
	res.render("du/receive_data.ejs", { deviceID: req.query.deviceID });
});

router.get("/received_data", (req, res) => {
	console.log("device ID: ", req.body.deviceID);
	queryForAllData = `select data_id, start_day, end_day, data_uri from data_packet where data_id in (select data_id_fk from receive where dataUser_id_fk = ?) and device_id_mk = ?`;
	con.query(queryForAllData, [req.session.userID, req.query.deviceID], (err, result) => {
		if (err) {
			const error = new Error(err);
			error.httpStatusCode = 400;
			return next(error);
		}
		res.status(200).json(result);
	});
});

router.get("/recevice_device", (req, res) => {
	res.render("DU/receive_device", {});
});

router.get("/decrypt_packet", (req, res) => {
	var getPacket = `select * from data_packet where data_id = ?;`;
	con.query(getPacket, req.body.dataID, async (err, result) => {
		if (err) {
			const error = new Error(err);
			error.httpStatusCode = 400;
			return next(error);
		}
		if (result.length == 0) {
			const error = new Error("Can't find device");
			error.httpStatusCode = 400;
			return next(error);
		}
		var data = JSON.parse(await getIpfs(result[0].data_uri));
		console.log("sk and pass: ", { sk: req.session.sk, pass: req.body.password });
		var dataUserSK = AES.decrypt(req.session.sk, req.body.password).toString(enc.Utf8);
		console.log("First data: ", data);
		getRek = `select re_key from receive where dataUser_id_fk = ? and data_id_fk= ? `;
		con.query(getRek, [req.session.userID, req.body.dataID], (err, key) => {
			// console.log(dataUserSK);
			PRE.reEncryption(key[0].re_key, data);
			console.log("Data user sk and data: ", { sk: dataUserSK, data: data });
			let decryptData = PRE.decryptData(dataUserSK, data);
			console.log(decryptData);
			res.send(decryptData);
		});
	});
	// res.send(test("aaaa"));
});

function test(inputStr) {
	var kp_A = PRE.Proxy.generate_key_pair();
	var sk_A = PRE.Proxy.to_hex(kp_A.get_private_key().to_bytes());
	var pk_A = PRE.Proxy.to_hex(kp_A.get_public_key().to_bytes());

	var kp_B = PRE.Proxy.generate_key_pair();
	var sk_B = PRE.Proxy.to_hex(kp_B.get_private_key().to_bytes());
	var pk_B = PRE.Proxy.to_hex(kp_B.get_public_key().to_bytes());

	console.log("SK: " + sk_B);
	console.log("PK:" + pk_B);

	let obj = PRE.encryptData(pk_A, inputStr);
	console.log(obj);
	let rk = PRE.generateReEncrytionKey(sk_A, pk_B);
	console.log("ReK:" + rk);
	PRE.reEncryption(rk, obj);
	console.log(obj);

	let decryptData = PRE.decryptData(sk_B, obj);
	console.log(decryptData);
}

function test2(inputStr) {
	PRE2.init({ g: "this is g", h: "that is h", returnHex: true }).then((params) => {
		console.log(params);
		const A = PRE2.keyGenInG1(params, { returnHex: true });
		const B = PRE2.keyGenInG2(params, { returnHex: true });
		console.log("key A:", A);
		const plain = PRE2.randomGen();
		const encrypted = PRE2.enc(plain, A.pk, params, { returnHex: true });
		console.log("encrypted: ", encrypted);
		const decrypted = PRE2.dec(encrypted, A.sk, params);
		console.log(plain === decrypted);
		const reKey = PRE2.rekeyGen(A.sk, B.pk, { returnHex: true });
		console.log("rek: ", reKey);
		const reEncypted = PRE2.reEnc(encrypted, reKey, { returnHex: true });
		console.log("re-encrypted: ", reEncypted);
		const reDecrypted = PRE2.reDec(reEncypted, B.sk);
		console.log(plain === reDecrypted);
		return reDecrypted;
	});
}

router.get("/view_data", (req, res) => {
	res.render("du/view_data", { dataID: req.query.dataID });
});

router.post("/getIpfs", async (req, res) => {
	let result = await getIpfs(req.body.cid);
	res.send(result);
});

module.exports = router;
