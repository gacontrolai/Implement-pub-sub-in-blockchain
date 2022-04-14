var express = require("express");
var router = express.Router();
var reencypt = require("../keyGen.js");
var multer = require("multer");
const fs = require("fs");
const PRE = require("recrypt-js");
const { stringify } = require("querystring");
const { create } = require("ipfs-http-client");
const ipfs = create();

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
  reencypt("Ai goi tui do");
  res.render("index", { title: "Express" });
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
  const hash = await addFiles(`[{${stringify(obj)}}]`);

  res.send({ rk: rk, hash: hash });
});

router.get("/aaaa", (req, res) => {
  res.render("template.ejs");
});
router.get("/showdevice", (req, res) => {
  res.render("show_device.ejs");
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
module.exports = router;
