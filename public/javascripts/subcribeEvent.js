function subRegister(event_func) {
	contract.events
		.Register({ fromBlock: 0 }, function (error, event) {
			console.log(event);
		})
		.on("data", event_func);
}

function subPub(deviceID, event_func) {
	contract.events
		.NewData({ filter: { deviceID: deviceID }, fromBlock: 0 }, function (error, event) {
			console.log(event);
		})
		.on("data", event_func);
}

function getDataByID(dataID, my_function) {
	contract
		.getPastEvents("NewData", {
			filter: { dataID: dataID },
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}

function getDeviceDetail(deviceID, event_func) {
	contract.events
		.Register({ filter: { id: deviceID }, fromBlock: 0 }, function (error, event) {
			console.log(event);
		})
		.on("data", event_func);
}

function getAllPastRegisterDevice(my_function) {
	contract
		.getPastEvents("Register", {
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}

function getRegisterDeviceByDO(dataOwner, my_function) {
	contract
		.getPastEvents("Register", {
			filter: { owner: dataOwner },
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}
function getSubscriberByDO(dataOwner, my_function) {
	contract
		.getPastEvents("Subscribe", {
			filter: { to: dataOwner },
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}

function getSelectedDevices(listOFDevices, my_function) {
	contract
		.getPastEvents("Register", {
			filter: { id: listOFDevices },
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}

function getSubscriptionBytxID(params) {
	contract
		.getPastEvents("Subscribe", {
			filter: { to: dataOwner },
			fromBlock: 0,
			toBlock: "latest",
		})
		.then(my_function);
}
