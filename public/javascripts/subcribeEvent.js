function subRegister(event_func) {
	contract.events
		.Register({ fromBlock: 0 }, function (error, event) {
			console.log(event);
		})
		.on("data", event_func);
}

function subPub(deviceID, event_func) {
	contract.events
		.newData({ filter: { deviceID: deviceID }, fromBlock: 0 }, function (error, event) {
			console.log(event);
		})
		.on("data", event_func);
}
