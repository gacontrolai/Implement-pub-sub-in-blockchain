const PubSub = artifacts.require("PubSub");
const helper = require("./helper.js");
const catchRevert = require("./exceptions.js").catchRevert;
const catchRevertReason = require("./exceptions.js").catchRevertReason;
contract("Publish Subscribe", function (accounts) {
	it("Should deploy", async () => {
		const pubsub = await PubSub.new();
		assert.isNotNull(pubsub, "Can't deploy contract");
	});
	it("Should register", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 1");
		await pubsub.register(deviceID, "Heat Sensor", "Measure temperature in Bien Hoa city 100 time a day", milliEtherToWei(1));
		let device = await pubsub.getDevice(deviceID);
		assert.isNotNull(device);
	});

	it("Should not register - Duplicate device ID", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 2");
		await pubsub.register(deviceID, "Heat Sensor", "Measure temperature in Bien Hoa city 100 time a day", milliEtherToWei(10));
		await catchRevert(pubsub.register(deviceID, "Heat Sensor", "Measure temperature in Bien Hoa city 100 time a day", milliEtherToWei(10)));
	});

	it("Should subscribe", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 1");
		let start_day = 1652313600000; // 12/5/2022
		let end_day = 1652918400000; // 19/5/2022
		duration = (end_day - start_day) / 1000 / 60 / 60 / 24;
		total_price = duration * milliEtherToWei(1);
		sub = await pubsub.subscribe(deviceID, start_day, end_day, "04f2020c7117be99567a1aa89d1cb75625810c26584a007864d8812b98af87e6a2284ea0909f3ece773e07b813deb13bd1986e409190503a01c3be11f5b04a9a23", {
			from: accounts[1],
			value: web3.utils.toBN(total_price),
		});
		// console.log("subscribe", getGasUsed(sub));
	});
	it("Should not subscribe - Lacking 1 wei", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 1");
		let start_day = 1652313600000; // 12/5/2022
		let end_day = 1652918400000; // 19/5/2022
		duration = (end_day - start_day) / 1000 / 60 / 60 / 24;
		total_price = duration * milliEtherToWei(1) - 1;
		await catchRevert(
			pubsub.subscribe(deviceID, start_day, end_day, "04f2020c7117be99567a1aa89d1cb75625810c26584a007864d8812b98af87e6a2284ea0909f3ece773e07b813deb13bd1986e409190503a01c3be11f5b04a9a23", {
				from: accounts[1],
				value: web3.utils.toBN(total_price),
			})
		);
	});

	it("Should not subscribe - Not exist device", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 0");
		let start_day = 1652313600000; // 12/5/2022
		let end_day = 1652918400000; // 19/5/2022
		duration = (end_day - start_day) / 1000 / 60 / 60 / 24;
		total_price = duration * milliEtherToWei(1);
		await catchRevert(
			pubsub.subscribe(deviceID, start_day, end_day, "04f2020c7117be99567a1aa89d1cb75625810c26584a007864d8812b98af87e6a2284ea0909f3ece773e07b813deb13bd1986e409190503a01c3be11f5b04a9a23", {
				from: accounts[1],
				value: web3.utils.toBN(total_price),
			})
		);
	});

	it("should publish", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 1");
		dataID = stringToBytes32("Test data 1");
		_from = 1652400000000;
		_to = 1652572800000;
		dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
		keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
		await pubsub.publish(deviceID, dataID, _from, _to, dataUri, keyUri);
		data = await pubsub.getData(dataID, deviceID);
		assert.isNotNull(data);
	});
	it("should not publish - Duplicate ID", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 1");
		dataID = stringToBytes32("Test data 1");
		_from = 1652400000000;
		_to = 1652572800000;
		dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
		keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
		await catchRevert(pubsub.publish(deviceID, dataID, _from, _to, dataUri, keyUri));
	});

	it("shouldnot publish - Not owner of device", async () => {
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 3");
		dataID = stringToBytes32("Test data 2");
		_from = 1652400000000;
		_to = 1652572800000;
		dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
		keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
		await catchRevert(pubsub.publish(deviceID, dataID, _from, _to, dataUri, keyUri));
	});

	it("Confirm multiple packet and check balance ", async () => {
		price = milliEtherToWei(1);
		const pubsub = await PubSub.deployed();
		deviceID = stringToBytes32("Test 4");

		await pubsub.register(deviceID, "Heat Sensor", "Measure temperature in Bien Hoa city 100 time a day", price);

		//subscribe
		let start_day = 1652313600000; // 12/5/2022
		let end_day = 1652918400000; // 19/5/2022
		duration = (end_day - start_day) / 1000 / 60 / 60 / 24;
		total_price = duration * price;
		await pubsub.subscribe(deviceID, start_day, end_day, "04f2020c7117be99567a1aa89d1cb75625810c26584a007864d8812b98af87e6a2284ea0909f3ece773e07b813deb13bd1986e409190503a01c3be11f5b04a9a23", {
			from: accounts[1],
			value: web3.utils.toBN(total_price),
		});

		//publish
		dataID1 = stringToBytes32("Test data 1");
		_from1 = 1652400000000; //13/5/2022
		_to1 = 1652572800000; //15/5/2022
		dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
		keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
		await pubsub.publish(deviceID, dataID1, _from, _to, dataUri, keyUri);
		//publish
		dataID2 = stringToBytes32("Test data 2");
		_from2 = 1652659200000; //16/5/2022
		_to2 = 1652745600000; //17/5/2022
		dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
		keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
		await pubsub.publish(deviceID, dataID2, _from2, _to2, dataUri, keyUri);

		//confirm
		let tx = await pubsub.getTx(accounts[1], accounts[0], start_day, end_day);
		let DO_balance_before = await web3.eth.getBalance(accounts[0]);
		haha = await pubsub.confirm(deviceID, [dataID1, dataID2], tx, { from: accounts[1] });
		// console.log("Confirm", getGasUsed(haha));
		duration = (_to1 + _to2 - _from1 - _from2) / 1000 / 60 / 60 / 24;
		expected_earn = duration * price;
		let expectedBalance = parseInt(DO_balance_before) + parseInt(expected_earn);
		let DO_balance_after = await web3.eth.getBalance(accounts[0]);
		expectmoney = await pubsub.calPackagePrice2(deviceID, [dataID1, dataID2]);
		assert.equal(DO_balance_after, expectedBalance);
	});
	// it("Check gas used", async () => {
	// 	hehe = await PubSub.new();
	// 	init = await web3.eth.getTransactionReceipt(hehe.transactionHash);
	// 	console.log("Gas to deploy", init.gasUsed);
	// 	totallGas = 0;
	// 	price = milliEtherToWei(1);
	// 	const pubsub = await PubSub.deployed();
	// 	deviceID = stringToBytes32("Test 6");

	// 	resgister = await pubsub.register(deviceID, "Heat Sensor", "Measure temperature in Bien Hoa city 100 time a day", price);
	// 	//publish
	// 	dataID = stringToBytes32(makeid(15));
	// 	_from2 = 1652659200000; //16/5/2022
	// 	_to2 = 1652745600000; //17/5/2022
	// 	dataUri = "Qmc14qjcb2Dvbb3dLhjkVnF7gsKEyo4Hs1B1w3V2hz7CXH";
	// 	keyUri = "Qmez5TLx2zPd4Rkst9dmsVdR6DecHz6UKBRC8KDQ787pet";
	// 	pub = await pubsub.publish(deviceID, dataID, _from2, _to2, dataUri, keyUri);
	// 	console.log("Register", getGasUsed(resgister));
	// 	console.log("publsih", getGasUsed(pub));
	// 	totallGas = resgister.receipt.gasUsed + pub.receipt.gasUsed;
	// 	totallGas;
	// 	//confirm
	// });
});

function stringToBytes32(str) {
	return web3.utils.padLeft(web3.utils.fromAscii(str), 64);
}

function getGasUsed(receipt) {
	return receipt.receipt.gasUsed;
}

function makeid(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function milliEtherToWei(number) {
	return web3.utils.toWei(
		web3.utils.toBN(number), // converts Number to BN, which is accepted by `toWei()`
		"milli"
	);
}
