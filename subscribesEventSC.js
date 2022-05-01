var contractJson = require("./build/contracts/PubSub.json");

var Web3 = require("web3");
const web3Provider = require("web3-providers-http");

var mysql = require("mysql");

const contractAddress = /* contractJson.networks[1337].address */ "0xBD099BbA224e34fb7273BB267B4A52Ed04c8B950";
const contractAbi = /* contractJson.abi */ [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "txID",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "bytes32[]",
				name: "dataID",
				type: "bytes32[]",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "pk",
				type: "string",
			},
		],
		name: "BuyPackage",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "bytes32[]",
				name: "dataID",
				type: "bytes32[]",
			},
			{
				internalType: "bytes32",
				name: "txId",
				type: "bytes32",
			},
		],
		name: "confirm",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bytes32[]",
				name: "dataID",
				type: "bytes32[]",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "txId",
				type: "bytes32",
			},
		],
		name: "Confirm",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "dataID",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "_from",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "_to",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "_dataUri",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "_keyUri",
				type: "string",
			},
		],
		name: "NewData",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "bytes32",
				name: "keyID",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "string",
				name: "uri",
				type: "string",
			},
		],
		name: "NewKey",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "dataID",
				type: "bytes32",
			},
			{
				internalType: "uint256",
				name: "_from",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "_to",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "keyUri",
				type: "string",
			},
			{
				internalType: "string",
				name: "dataUri",
				type: "string",
			},
		],
		name: "publish",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "string",
				name: "deviceName",
				type: "string",
			},
			{
				internalType: "string",
				name: "_decribe",
				type: "string",
			},
			{
				internalType: "uint256",
				name: "pricePerDay",
				type: "uint256",
			},
		],
		name: "register",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "string",
				name: "deviceName",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "_decribe",
				type: "string",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "Register",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "uint256",
				name: "_from",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "_to",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "_pubKey",
				type: "string",
			},
		],
		name: "subscribe",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "payable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				indexed: true,
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "bytes32",
				name: "txID",
				type: "bytes32",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "start",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "end",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "pk",
				type: "string",
			},
		],
		name: "Subscribe",
		type: "event",
	},
	{
		stateMutability: "payable",
		type: "fallback",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "dataID",
				type: "bytes32",
			},
			{
				internalType: "string",
				name: "keyUri",
				type: "string",
			},
		],
		name: "updateKey",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "bytes32[]",
				name: "dataID",
				type: "bytes32[]",
			},
		],
		name: "calPackagePrice",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "dataID",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
		],
		name: "getData",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "deviceID",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "dataID",
				type: "bytes32",
			},
		],
		name: "getRek",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32",
			},
		],
		name: "isUsed",
		outputs: [
			{
				internalType: "bool",
				name: "used",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		name: "usedId",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));

var contractInstance = new web3.eth.Contract(contractAbi, contractAddress);

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: process.env.DATABASEPASS,
	database: process.env.DATABASENAME,
	multipleStatements: true,
});

function listenNewData() {
	contractInstance.events.NewData({ fromBlock: "latest" }).on("data", (event) => {
		var storeDevice = "";
	});
}

function listenSubscribe() {
	contractInstance.events.Subscribe({ fromBlock: "latest" }).on("data", (event) => {
		console.log("receive event", event.returnValues);
		// event Subscribe(
		//     address indexed from,
		//     address indexed to,
		//     bytes32 indexed deviceID,
		//     bytes32 txID,
		//     uint256 start,
		//     uint256 end,
		//     uint256 price,
		//     string pk
		// );
		var eventData = {
			from: event.returnValues.from,
			to: event.returnValues.to,
			deivceID: bytes32ToString(event.returnValues.deviceID),
			txID: event.returnValues.txID,
			start: event.returnValues.start,
			end: event.returnValues.end,
			price: event.returnValues.price,
			pk: event.returnValues.pk,
		};
		var getDataUser = `select account_ID  from account where  bc_address = '${eventData.from}' and role = 'DU'`;
		console.log("query for DU:", getDataUser);
		con.query(getDataUser, (err, result) => {
			if (err) throw err;
			if (result.length != 0) {
				result[0].account_ID;
				var values = [[result[0].account_ID, eventData.deivceID, eventData.start, eventData.end]];
				var subscribe = `insert into register (du_id_fk, device_id_fk,start_day,end_day) values ?`;
				con.query(subscribe, [values], (err2, result2) => {
					if (err2) throw err2;
					console.log(result2);
				});
			} else {
			}
		});
		var storeDevice = "";
	});
}

function bytes32ToString(inputBytes) {
	return web3.utils.hexToUtf8(inputBytes);
}

module.exports = () => {
	console.log("day la module exports");
	listenSubscribe();
};
