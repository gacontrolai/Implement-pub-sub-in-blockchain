// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PubSub {
    uint256 constant private SECADAY = 86400;
    mapping (bytes32 => Devices) userDevices; // deviceID to device
    mapping (bytes32 => bool) public usedId; // deviceID to bool
    mapping (bytes32 => mapping ( bytes32 => SensorData) ) devicesData; // from deviceID to dataID 
    mapping (bytes32 => mapping  (address => bytes32)) rek; // from dataID to DU address to rek 
    mapping (bytes32 =>  bytes32) keyData;
    struct Devices {
        address owner;
        string decribe;
        uint256 pricePerDay;
    }

    struct SensorData{
      string uri;
      uint256 from;
      uint256 to;
    }

    event Register ( address indexed owner, bytes32 indexed id, string _decribe, uint256 price);
    event Subcribe (address indexed from, address to, bytes32 deviceID,uint256 start, uint256 end, uint256 price, bytes32 pk);
    event newData (bytes32 deviceID , bytes32 dataID , bytes32 keyID,uint256 _from, uint256 _to, string  _uri);

    fallback() external payable {}

    function register (bytes32 deviceID, string calldata  _decribe, uint256 pricePerDay) external returns(uint256) {
        require(usedId[deviceID] != true , "Pubsub: ID already taken");
        userDevices[deviceID] = Devices(msg.sender, _decribe, pricePerDay) ;
        usedId[deviceID] = true;
        emit Register(msg.sender, deviceID, _decribe, pricePerDay);
    }

    function publish (bytes32 deviceID , bytes32 dataID , bytes32 keyID,uint256 _from, uint256 _to, string calldata _uri ) external {
        require(usedId[deviceID]  == true, "Pubsub: deviceID not found ");
        keyData[dataID] = keyID;
        devicesData[deviceID][dataID]= SensorData(_uri,_from,_to);
    }

    function createKey (bytes32 keyID , address [] calldata listSub, bytes32 [] calldata listRek ) external {
        for (uint256 count =0; count < listSub.length; count =count +1 ){
            rek[keyID][listSub[count]] = listRek[count];
        } 
    }

    function subcribe (bytes32 deviceID ,uint256 _from, uint256 _to, bytes32 _pubKey) external payable {
        uint256 price =  (_from -_to)/SECADAY*userDevices[deviceID].pricePerDay;
        require (msg.value >= price, "Amount is sufficient");
        payable(this).transfer(price);
        emit Subcribe ( msg.sender,  userDevices[deviceID].owner,  deviceID, _from,  _to,  price, _pubKey);
    }

    function getData (bytes32 dataID, bytes32 deviceID) external view returns (string memory) {
        devicesData[deviceID][dataID].uri;
    }

    function getRek (bytes32 dataID) external view returns(bytes32) {
        bytes32 keyID = keyData[dataID] ;
        rek[keyID][msg.sender];
    }
}