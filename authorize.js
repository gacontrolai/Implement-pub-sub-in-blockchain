const { request } = require("express");
const session = require("express-session");

function checkAuthenticate(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		console.log(req.url);
		req.session.page = req.url;
		var str = encodeURIComponent("Please login to view the contain");
		res.redirect("/login?err=" + str);
	}
}

function checkDataOwner(req, res, next) {
	if (req.session.role == "DO") {
		next();
	} else {
		console.log(req.url);
		req.session.page = req.url;
		var str = encodeURIComponent("Please login as data owner account view the contain");
		res.redirect("/login?err=" + str);
	}
}

function checkDataUser(req, res, next) {
	if (req.session.role == "DU") {
		next();
	} else {
		console.log(req.url);
		req.session.page = req.url;
		var str = encodeURIComponent("Please login as data user account view the contain");
		res.redirect("/login?err=" + str);
	}
}
module.exports = { checkAuthenticate, checkDataOwner, checkDataUser };
