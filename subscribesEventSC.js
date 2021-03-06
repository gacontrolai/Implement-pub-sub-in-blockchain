var contractJson = require("./build/contracts/PubSub.json");

var Web3 = require("web3");

const { create } = require("ipfs-http-client");

var mysql = require("mysql");

const networkID = 1337;

const contractAddress = contractJson.networks[networkID].address;
const contractAbi = contractJson.abi;

var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));

var contractInstance = new web3.eth.Contract(contractAbi, contractAddress);

ipfs = create();

var con = mysql.createConnection({
	host: "localhost",
	user: process.env.DATABASEUSER,
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
				var duration = [eventData.start, eventData.end, eventData.deivceID];
				var getPastPacekt = `select * from data_packet  where ? <= start_day and ? >= end_day and device_id_mk = ?`;
				con.query(getPastPacekt, duration, (err, packets) => {
					if (err) throw err;
					if (packets.length != 0) {
						console.log("Past packet: ", packets);
						var values = [[result[0].account_ID, eventData.deivceID, eventData.start, eventData.end, eventData.txID, 0, Date.now()]];
						var subscribe = `insert into register (du_id_fk, device_id_fk,start_day,end_day,trans_id, is_updated, subscribe_time) values ?`;
						con.query(subscribe, [values], (err2, result2) => {
							if (err2) throw err2;
							console.log(result2);
						});
					} else {
						var values = [[result[0].account_ID, eventData.deivceID, eventData.start, eventData.end, eventData.txID, 1, Date.now()]];
						var subscribe = `insert into register (du_id_fk, device_id_fk,start_day,end_day,trans_id, is_updated, subscribe_time) values ?`;
						con.query(subscribe, [values], (err2, result2) => {
							if (err2) throw err2;
							console.log(result2);
						});
					}
				});
			} else {
			}
		});
		var storeDevice = "";
	});
}

function listenNewKey() {
	contractInstance.events.NewKey({ fromBlock: "latest" }).on("data", async (event) => {
		console.log("receive Publish event");
		let keyStr = await getIpfs(event.returnValues.keyUri);
		let key = JSON.parse(keyStr);
		var arrAddress = [];
		var arrOfRekToInsert = [];

		con.query("Select * from register where trans_id =  ?", event.returnValues.txID, (err, trans) => {
			tran = trans[0];
			key.forEach((element) => {
				arrAddress.push([tran.du_id_fk, element.dataID, element.rek, tran.device_id_fk]);
			});
			console.log(arrAddress);
			con.query("INSERT INTO receive (dataUser_id_fk, data_id_fk, re_key, device_id_mk ) VALUES ?", [arrAddress], (err2, result2) => {
				if (err2) {
					return console.log(err2);
				}
				console.log("sucess");
			});
		});
	});
}

function bytes32ToString(inputBytes) {
	return web3.utils.hexToUtf8(inputBytes);
}

module.exports = () => {
	listenSubscribe();
	listenPublish();
	listenNewKey();
};
