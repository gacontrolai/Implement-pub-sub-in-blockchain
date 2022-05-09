// 0xf17824cb47e4170a7583daa87492df7de4ac0b77;
// 0xd7d7e14be9baecdb9ff3db1e2fe9376374bc3c52;
const addressOfContract = "0xBD099BbA224e34fb7273BB267B4A52Ed04c8B950";
const abi = [
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
		payable: true,
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
		constant: true,
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
		constant: true,
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
		payable: true,
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
		constant: true,
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
		constant: true,
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
		constant: true,
	},
];
