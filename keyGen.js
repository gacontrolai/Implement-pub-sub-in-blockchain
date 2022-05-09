const PRE = require("recrypt-js");

function test(inputStr) {
	var kp_A = PRE.Proxy.generate_key_pair();
	var sk_A = PRE.Proxy.to_hex(kp_A.get_private_key().to_bytes());
	var pk_A = PRE.Proxy.to_hex(kp_A.get_public_key().to_bytes());

	var kp_B = PRE.Proxy.generate_key_pair();
	var sk_B = PRE.Proxy.to_hex(kp_B.get_private_key().to_bytes());
	var pk_B = PRE.Proxy.to_hex(kp_B.get_public_key().to_bytes());

	console.log("SK: " + sk_B);
	console.log("PK:" + pk_B);

	let obj = PRE.encryptData(pk_A, inputStr);
	console.log(obj);
	let rk = PRE.generateReEncrytionKey(sk_A, pk_B);
	console.log("ReK:" + rk);
	PRE.reEncryption(rk, obj);
	console.log(obj);

	let decryptData = PRE.decryptData(sk_B, obj);
	console.log(decryptData);
}

module.exports = test;
