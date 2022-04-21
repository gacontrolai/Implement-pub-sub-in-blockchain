// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PubSub {
    uint256 private constant SECADAY = 86400;
    mapping(bytes32 => Devices) userDevices; // deviceID to device
    mapping(bytes32 => bool) public usedId; // deviceID to bool
    mapping(bytes32 => mapping(bytes32 => SensorData)) devicesData; // from deviceID to dataID
    mapping(bytes32 => string) rek; // from dataID to DU address to rek
    mapping(bytes32 => bytes32) keyData;
    struct Devices {
        address owner;
        string decribe;
        uint256 pricePerDay;
    }

    struct SensorData {
        string uri;
        uint256 from;
        uint256 to;
    }

    event Register(
        address indexed owner,
        bytes32 indexed id,
        string _decribe,
        uint256 price
    );
    event Subcribe(
        address indexed from,
        address to,
        bytes32 deviceID,
        uint256 start,
        uint256 end,
        uint256 price,
        bytes32 pk
    );
    event newData(
        bytes32 indexed deviceID,
        bytes32 indexed dataID,
        bytes32 indexed keyID,
        uint256 _from,
        uint256 _to,
        string _uri
    );
    event NewKey(bytes32 keyID, string uri);

    fallback() external payable {}

    function register(
        bytes32 deviceID,
        string calldata _decribe,
        uint256 pricePerDay
    ) external returns (uint256) {
        require(!isUsed(deviceID), "PubSub: Id have been used");
        userDevices[deviceID] = Devices(msg.sender, _decribe, pricePerDay);
        usedId[deviceID] = true;
        emit Register(msg.sender, deviceID, _decribe, pricePerDay);
    }

    function isUsed(bytes32 id) public view returns (bool used) {
        used = usedId[id];
    }

    function publish(
        bytes32 deviceID,
        bytes32 dataID,
        bytes32 keyID,
        uint256 _from,
        uint256 _to,
        string calldata dataUri
    ) external {
        require(userDevices[deviceID].owner == msg.sender,"PubSub: You are not the owner of this device");
        keyData[dataID] = keyID;
        devicesData[deviceID][dataID] = SensorData(dataUri, _from, _to);
        emit newData(deviceID, dataID, keyID, _from, _to, dataUri);
    }

    function createKey (bytes32 keyID , string calldata _uri ) external {
        require(bytes(rek[keyID]).length == 0, "This key have been used" );
        rek[keyID]= _uri;
        emit NewKey(keyID, _uri);
    }

    function updateKey(
        bytes32 deviceID,
        bytes32 dataID,
        bytes32 keyID
    ) public {
        require(userDevices[deviceID].owner == msg.sender);
        keyData[dataID] = keyID;
    }

    function subcribe(
        bytes32 deviceID,
        uint256 _from,
        uint256 _to,
        bytes32 _pubKey
    ) external payable {
        uint256 price = ((_from - _to) / SECADAY) *
            userDevices[deviceID].pricePerDay;
        require(msg.value >= price, "Amount is sufficient");
        payable(this).transfer(price);
        emit Subcribe(
            msg.sender,
            userDevices[deviceID].owner,
            deviceID,
            _from,
            _to,
            price,
            _pubKey
        );
    }

    function getData(bytes32 dataID, bytes32 deviceID)
        external
        view
        returns (string memory)
    {
        devicesData[deviceID][dataID].uri;
    }

    function getRek(bytes32 dataID) external view returns (string memory) {
        bytes32 keyID = keyData[dataID];
        return rek[keyID];
    }
}
