var express = require("express");
var router = express.Router();
var reencypt = require("../keyGen.js");
var multer = require("multer");
const fs = require("fs");
const PRE = require("recrypt-js");
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
	for await (const buf of await ipfs.cat(CID)) {
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

router.post("/decrypt_packet", (req, res) => {
	var getPacket = `select * from data_packet where data_id = ?;`;
	console.log("Entering query");
	con.query(getPacket, req.body.dataID, async (err, result) => {
		if (err) {
			return res.status(400).send(err);
		}
		if (result.length == 0) {
			return res.status(400).send("Can't find devices");
		}
		if (!bcrypt.compareSync(req.body.password, req.session.password)) {
			return res.status(401).send("Wrong password");
		}
		console.log("getting ipfs");
		rawData = await getIpfs(result[0].data_uri);
		console.log(rawData);
		let data = JSON.parse(await getIpfs(result[0].data_uri));
		console.log("sk and pass: ", { sk: req.session.sk, pass: req.body.password });
		let dataUserSK = AES.decrypt(req.session.sk, req.body.password).toString(enc.Utf8);
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

router.get("/list_subscribe", (req, res) => {
	res.render("du/view_subscription", { dataID: req.query.dataID });
});

router.post("/get_subscription", (req, res) => {
	queryForSub = `select device_id_fk, start_day, end_day, trans_id from register where du_id_fk = ? `;
	con.query(queryForSub, [req.session.userID], (err, result) => {
		if (err) {
			return res.status(400).send(err);
		}
		if (result.length == 0) {
			return res.status(400).send("Can't find any subscription");
		}
		res.status(200).send(result);
	});
});

router.get("/view_data", (req, res) => {
	res.render("du/view_data", { dataID: req.query.dataID });
});

router.get("/view_confirm_received_data", (req, res) => {
	res.render("du/view_confirm_data", { trans: req.query.trans_id });
});

router.post("/confirm_received_data", (req, res) => {
	var query = `select device_id_fk, data_id_fk, data_packet.start_day, data_packet.end_day, confirm from (receive join data_packet on data_id_fk = data_id) join register on device_id_fk= receive.device_id_mk where trans_id = ? and du_id_fk = ? and data_packet.start_day >= register.start_day  and data_packet.end_day <= register.end_day  ;`;
	con.query(query, [req.body.trans_id, req.session.userID], (err, result) => {
		if (err) {
			res.send(err);
		}
		console.log(query);
		res.send(result);
	});
});

router.post("/store_confirmed_data", (req, res) => {
	con.query(`UPDATE receive SET confirm = 1 where data_id_fk in (?)`, [req.body.dataID], (err, result) => {
		if (err) {
			return res.send(err);
		}
		res.send("success");
	});
});

router.post("/getIpfs", async (req, res) => {
	let result = await getIpfs(req.body.cid);
	res.send(result);
});

router.post("/update_data_status", (req, res) => {
	con.query("UPDATE receive SET confirm = 1 where data_id_fk in ? and dataUser_id_fk = ?", [req.body.dataID, req.session.userID], (err, result) => {
		if (err) {
			return res.send(err);
		}
		res.send(result);
	});
});

module.exports = router;
