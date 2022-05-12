var contractJson = require("./build/contracts/PubSub.json");

var Web3 = require("web3");

const { create } = require("ipfs-http-client");

var mysql = require("mysql");

const contractAddress = contractJson.networks[1337].address;
const contractAbi = contractJson.abi;

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));

var contractInstance = new web3.eth.Contract(contractAbi, contractAddress);

ipfs = create();

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

function listenPublish() {
	contractInstance.events.NewData({ fromBlock: "latest" }).on("data", async (event) => {
		console.log("receive Publish event");
		let keyStr = await getIpfs(event.returnValues._keyUri);
		let key = JSON.parse(keyStr);
		var arrAddress = [];
		var arrOfRekToInsert = [];
		key.forEach((element) => {
			arrAddress.push(element.address);
		});
		con.query(`select * from account where bc_address in (${con.escape(arrAddress)}) and role = "DU"`, (err, result) => {
			if (err) {
				console.log(err);
				return;
			}
			if (result.length == 0) {
				console.log("No address match");
				return;
			}
			var dataID = bytes32ToString(event.returnValues.dataID);
			result.forEach((account) => {
				userKey = key.find((e) => e.address == account.bc_address);
				arrOfRekToInsert.push([account.account_ID, dataID, bytes32ToString(event.returnValues.deviceID), userKey.rek]);
			});
			con.query(`Insert into receive (dataUser_id_fk, data_id_fk, device_id_mk, re_key) values ?`, [arrOfRekToInsert], (err, success) => {
				if (err) {
					console.log(err);
				}
				console.log("Insert receive: ", result);
			});
		});
	});
}
async function getIpfs(CID) {
	for await (const buf of ipfs.cat(CID)) {
		console.log(buf.toString());
		return buf.toString();
	}
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
			console.log("day la result subcribe", result);
			if (err) throw err;
			if (result.length != 0) {
				var values = [[result[0].account_ID, eventData.deivceID, eventData.start, eventData.end, eventData.txID]];
				var subscribe = `insert into register (du_id_fk, device_id_fk,start_day,end_day,trans_id) values ?`;
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
	listenPublish();
};
