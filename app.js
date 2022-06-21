var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var DORouter = require("./routes/dataOwner");
var DURouter = require("./routes/dataUser");
var usersRouter = require("./routes/users");
var apiRouter = require("./routes/api");
var { checkAuthenticate, checkDataOwner, checkDataUser } = require("./authorize");

const subscribeSC = require("./subscribesEventSC.js");

var session = require("express-session")({
	secret: "gacon",
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false },
});

// var mysql = require("mysql");

// var con = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "232425",
// });

// con.connect(function (err) {
// 	if (err) throw err;
// 	console.log("Connected!");
// });

var app = express();
app.use(session);
subscribeSC();

// console.log("Eth Node Version: ", web3.version.node);
// //console.log("Network: " ,web3.version.network, web3.version.ethereum);
// console.log("Connected: ", web3.isConnected(), web3.currentProvider);
// console.log("syncing: ", web3.eth.syncing, ", Latest Block: ", web3.eth.blockNumber);
// console.log("Accounts[0]: ", web3.eth.accounts[0], ":", web3.eth.getBalance(web3.eth.accounts[0]).toNumber());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);
app.use("/DO", checkDataOwner, DORouter);
app.use("/DU", checkDataUser, DURouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
