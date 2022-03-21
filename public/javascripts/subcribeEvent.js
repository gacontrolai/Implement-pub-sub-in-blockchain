function subRegister() {
	return contract.events.Register({}, function (error, event) {
		console.log(event);
	});
	// .on("connected", function (subscriptionId) {
	// 	console.log(subscriptionId);
	// })
	// .on("data", function (event) {
	// 	console.log(event); // same results as the optional callback above
	// });
}

function subPub() {
	return contract.events.newData({}, function (error, event) {
		console.log(event);
	});
	// .on("connected", function (subscriptionId) {
	// 	console.log(subscriptionId);
	// })
	// .on("data", function (event) {
	// 	console.log(event); // same results as the optional callback above
	// });
}
