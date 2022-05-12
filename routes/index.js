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

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("sign-in.ejs");
});

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

// SK: bcaffd340a842f00733c133b173eb51d6d4eb02c371205ee7e67cb866154c932
// string
// 04beb4ddf45a87558eb307a9eda6c48a359da06b93e0c83169f4dc690514f6da25361de2ed8ada2db3fea64125e9eb487147ce10dcb957fac4287011831e69bff4

router.post("/getKey", async (req, res) => {
	sk_A = req.body.sk;
	pk_B = req.body.pk;
	sub = req.body.listSub;
	console.log(sub);
	console.log(sk_A);
	console.log(pk_B);
	rk = PRE.generateReEncrytionKey(sk_A, pk_B);
	obj = { sub: sub, rek: rk };
	const hash = await addFiles(`[{${JSON.stringify(obj)}}]`);

	res.send({ rk: rk, hash: hash });
});

router.get("/aaaa", (req, res) => {
	res.render("template.ejs");
});

router.get("/sign-in", (req, res) => {
	res.render("sign-in.ejs");
});

router.get("/sign-up", (req, res) => {
	res.render("sign-up.ejs");
});
// router.post("/getKey", async (req, res) => {
// 	sk_A = req.body.sk;
// 	pk_B = req.body.pk;
// 	sub = req.body.listSub;
// 	console.log(sub);
// 	console.log(sk_A);
// 	console.log(pk_B);
// 	rk = PRE.generateReEncrytionKey(sk_A, pk_B);
// 	obj = { sub: sub, rek: rk };
// 	const hash = await addFiles(`[{${stringify(obj)}}]`);

// 	res.send({ rk: rk, hash: hash });
// });

router.post("/register", async (req, res) => {
	let key = PRE.Proxy.generate_key_pair();
	var sk = PRE.Proxy.to_hex(key.get_private_key().to_bytes());
	var pk = PRE.Proxy.to_hex(key.get_public_key().to_bytes());
	var passwordHash = await bcrypt.hash(req.body.password, parseInt(process.env.SALTROUND));
	var encrypted_sk = AES.encrypt(sk, req.body.password).toString();
	console.log(req.body);
	// console.log(AES.decrypt(encrypted_sk, req.body.password).toString(enc.Utf8));
	if (req.body.userType == "DU") {
		getAccount = `SELECT * FROM account WHERE username = "${req.body.username}" or bc_address = "${req.body.address}"`;
		storeAccount = `INSERT INTO account (username,password, bc_address,private_key,public_key,role) VALUES ('${req.body.username}','${passwordHash}','${req.body.address}','${encrypted_sk}','${pk}','DU');
		INSERT INTO data_user  VALUES(LAST_INSERT_ID());`;
	} else {
		getAccount = `SELECT * FROM account WHERE username = "${req.body.username}" or bc_address = "${req.body.address}"`;
		storeAccount = `INSERT INTO account (username,password,bc_address,private_key,public_key,role) VALUES ('${req.body.username}','${passwordHash}','${req.body.address}','${encrypted_sk}','${pk}','DO');
		INSERT INTO data_owner  VALUES(LAST_INSERT_ID());`;
	}
	con.query(getAccount, function (err, result) {
		if (err) throw err;
		console.log("Result: " + result);
		if (result.length == 0) {
			con.query(storeAccount, function (err2, result2) {
				if (err2) throw err2;
				console.log(result2);
				res.status(200).send("User created");
			});
		} else {
			res.status(400).send("Dulplicate Username or blockchain address");
		}
	});
});

router.post("/log-in", (req, res) => {
	let getAccount = `select * from account where username = '${req.body.username}' and bc_address = '${req.body.address}'`;
	// console.log(req.body);
	con.query(getAccount, function (err, result) {
		if (err) throw err;
		if (result.length == 0) {
			res.send("No user found");
			return;
		}
		if (bcrypt.compareSync(req.body.password, result[0].password)) {
			let account = result[0];
			req.session.userID = account.account_ID;
			req.session.role = account.role;
			req.session.sk = account.private_key;
			req.session.pk = account.public_key;
			req.session.password = account.password;
			res.cookie("pk", account.public_key);
			console.log("req.session: ", req.session);
			if (account.role == "DU") {
				res.redirect("DU/showdevice");
			} else {
				res.redirect("DO/register_device");
			}
		} else {
			res.send("Incorrect password");
		}
	});
});

router.get("/sign-out", function (req, res, next) {
	req.session.destroy();
	res.redirect("/sign-in");
});
module.exports = router;
