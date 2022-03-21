async function loadContract() {
	return await new window.web3.eth.Contract(abi, addressOfContract);
}

window.ethereum.on("accountsChanged", function (accounts) {
	document.getElementById("TaiKhoan").innerHTML = accounts;
	var receiveData = (data, textStatus, jqXHR) => {
		if (data == false) {
			$.get("/users/logout", function (data) {
				alert("Account and wallet does not match please login again with appropriate wallet");
				location.reload();
			});
		}
	};
	// $.ajax({
	// 	type: "POST",
	// 	url: "/users/checkWallet",
	// 	data: { wallet: accounts[0] },
	// 	success: receiveData,
	// 	dataType: "json",
	// });
	// account = accounts[0];
});

// Run contract
async function load() {
	console.log("loading ....");
	await loadWeb3();
	window.contract = await loadContract();
	method = window.contract.methods;
	console.log("Ready!");
}

//load web3
async function loadWeb3() {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		window.ethereum.enable();
		account = await getCurrentAccount();
		console.log(account);
	}
}

//Get account
async function getCurrentAccount() {
	const accounts = await window.web3.eth.getAccounts();
	document.getElementById("TaiKhoan").innerHTML = accounts[0];
	return accounts[0];
}
