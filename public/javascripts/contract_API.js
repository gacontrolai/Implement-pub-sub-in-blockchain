async function getBalance() {
	// const account = await getCurrentAccount();
	var balance = document.getElementById("Balance");
	return await method.balanceOf(account).call({ from: account });
}

async function getused(deviceID) {
	await method.getused(deviceID);
}

async function register(deviceID, _decribe, pricePerDay) {
	haha = await method.register(deviceID, _decribe, pricePerDay).send({ from: account });
	return haha;
}

async function createKey(keyID, listSub) {
	await method.createKey(keyID, listSub).send({ from: account });
}

async function mintTo(data, address) {
	// const account = await getCurrentAccount();
	await method
		.mintTo(address, data)
		.send({ from: account })
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			console.log(err);
		});
}

async function getMiner(tokenID) {
	// const account = await getCurrentAccount();
	return method.getMiner(tokenID).call({ from: account });
}

async function getToken(tokenID) {
	// const account = await getCurrentAccount();
	return method.tokenOfOwnerByIndex(account, tokenID).call({ from: account });
}

async function getAllToken() {
	// const account = await getCurrentAccount();
	// let tokenID = [];
	// let amountToken = await getBalance();
	// console.log(amountToken);
	// for (let index = 0; index < amountToken; index++) {
	// 	tokenID[index] = await getToken(index);
	// 	// console.log("getAllToken: " + tokenID);
	// }
	// console.log(tokenID);
	return method.getAllToken(account).call({ from: account });
}

async function getAllURI(inputAccount) {
	// const account = await getCurrentAccount();
	if (inputAccount == null) inputAccount = account;
	let URI = [];
	let arrTokenID = await method.getAllURI(inputAccount).call({ from: account });
	console.log(arrTokenID);
	// for (let index = 0; index < arrTokenID.length; index++) {
	// 	const tokenID = arrTokenID[index];
	// 	temp = await method.tokenURI(tokenID).call();
	// 	console.log(temp);
	// 	URI.push(temp);
	// }
	// // console.log(URI);
	return arrTokenID;
}

async function getURI(tokenID) {
	return method.tokenURI(tokenID).call();
}

async function setInfo(data) {
	let res = await method.setInfo(data).send({ from: account });
	return res;
}

async function getInfo() {
	let res = await method.getInfo().call({ from: account });
	return res;
}

async function getDataFromIPFS(IPFSValue) {
	return axios({
		method: "post",
		url: "/users/getIPFS",
		data: {
			data: IPFSValue,
		},
	});
}

async function getPendingToken() {
	return method.getPedingToken().call({ from: account });
}

async function acceptPendingToken(pos) {
	return method.acceptToken(pos).send({ from: account });
}

async function declienPendingToken(pos) {
	return method.declineToken(pos).send({ from: account });
}

async function getPendingWallet() {
	return method.getPedingWallet().call({ from: account });
}

async function acceptAuthorize(pos) {
	return method.acceptAuthorize(pos).send({ from: account });
}

async function declineAuthorize(pos) {
	return method.declineAuthorize(pos).send({ from: account });
}

async function getAutho() {
	return await method.getAuthorizedAccount().call({ from: account });
}

async function requestAutho(acc) {
	return await method.requestAuthorize(acc).send({ from: account });
}
