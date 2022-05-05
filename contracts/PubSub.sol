// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PubSub {
    uint256 private constant SECADAY = 86400000;
    mapping(bytes32 => Devices) userDevices; // deviceID to device
    mapping(bytes32 => bool) public usedId; // deviceID to bool
    mapping(bytes32 => mapping(bytes32 => SensorData)) devicesData; // from deviceID to dataID
    mapping(bytes32 => mapping(bytes32 => string)) rek; // from deviceID to dataID to  rek
    // mapping (address => mapping(address => uint256 [] )) transaction; //from DO to DU to arr of fee
    mapping(address => mapping(address => mapping(bytes32 => uint256))) transactionList; // from DO to DU to transactionID to amount
    struct Devices {
        address owner;
        string name;
        string decribe;
        uint256 pricePerDay;
    }

    struct SensorData {
        bool isUsed;
        string uri;
        uint256 from;
        uint256 to;
    }

    event Register(
        address indexed owner,
        bytes32 indexed id,
        string deviceName,
        string _decribe,
        uint256 price
    );
    event Subscribe(
        address indexed from,
        address indexed to,
        bytes32 indexed deviceID,
        bytes32 txID,
        uint256 start,
        uint256 end,
        uint256 price,
        string pk
    );

    event BuyPackage(
        address indexed from,
        address indexed to,
        bytes32 indexed deviceID,
        uint256 txID,
        bytes32[] dataID,
        uint256 price,
        string pk
    );

    event NewData(
        bytes32 indexed deviceID,
        bytes32 indexed dataID,
        uint256 _from,
        uint256 _to,
        string _dataUri,
        string _keyUri
    );
    event NewKey(bytes32 keyID, string uri);

    event Confirm(
        address indexed from,
        address indexed to,
        bytes32[] dataID,
        uint256 amount,
        bytes32 indexed txId
    );

    fallback() external payable {}

    function register(
        bytes32 deviceID,
        string calldata deviceName,
        string calldata _decribe,
        uint256 pricePerDay
    ) external {
        require(!isUsed(deviceID), "PubSub: Id have been used");
        userDevices[deviceID] = Devices(
            msg.sender,
            deviceName,
            _decribe,
            pricePerDay
        );
        usedId[deviceID] = true;
        emit Register(msg.sender, deviceID, deviceName, _decribe, pricePerDay);
    }

    function isUsed(bytes32 id) public view returns (bool used) {
        used = usedId[id];
    }

    function publish(
        bytes32 deviceID,
        bytes32 dataID,
        uint256 _from,
        uint256 _to,
        string calldata keyUri,
        string calldata dataUri
    ) external {
        require(
            userDevices[deviceID].owner == msg.sender,
            "PubSub: You are not the owner of this device"
        );
        rek[deviceID][dataID] = keyUri;
        devicesData[deviceID][dataID] = SensorData(true, dataUri, _from, _to);
        emit NewData(deviceID, dataID, _from, _to, dataUri, keyUri);
    }

    function updateKey(
        bytes32 deviceID,
        bytes32 dataID,
        string calldata keyUri
    ) public {
        require(
            userDevices[deviceID].owner == msg.sender,
            "Pubsub: You are not the owner"
        );
        require(
            devicesData[deviceID][dataID].isUsed == true,
            "Pubsub: Data id is not correct"
        );
        rek[deviceID][dataID] = keyUri;
    }

    function subscribe(
        bytes32 deviceID,
        uint256 _from,
        uint256 _to,
        string calldata _pubKey
    ) external payable returns (bytes32) {
        require(_from != _to, "Pubsub: can not subscribe to your own device");
        require(
            userDevices[deviceID].owner != address(0x0),
            "Pubsub: device is not registered yet"
        );
        require(_from < _to, "Pubsub: end time much larger than begin time");
        Devices memory device = userDevices[deviceID];
        uint256 price = ((_to - _from) / SECADAY) * device.pricePerDay;
        require(msg.value >= price, "Amount is sufficient");

        bytes32 txId = keccak256(
            abi.encodePacked(msg.sender, device.owner, block.timestamp)
        );

        payable(this).transfer(price);
        emit Subscribe(
            msg.sender,
            device.owner,
            deviceID,
            txId,
            _from,
            _to,
            price,
            _pubKey
        );
        return txId;
    }

    function calPackagePrice(bytes32 deviceID, bytes32[] memory dataID)
        public
        view
        returns (uint256)
    {
        Devices memory device = userDevices[deviceID];
        uint256 duration = 0;
        for (uint256 i; i < dataID.length; i = i + 1) {
            duration +=
                devicesData[deviceID][dataID[i]].to -
                devicesData[deviceID][dataID[i]].from;
        }
        uint256 price = (duration / SECADAY) * device.pricePerDay;
        return price;
    }

    function confirm(
        bytes32 deviceID,
        bytes32[] calldata dataID,
        bytes32 txId
    ) external {
        require(
            userDevices[deviceID].owner != address(0x0),
            "Pubsub: device is not registered yet"
        );
        Devices memory device = userDevices[deviceID];
        uint256 totalprice = calPackagePrice(deviceID, dataID);
        transactionList[device.owner][msg.sender][txId] -= totalprice;
        emit Confirm(msg.sender, device.owner, dataID, totalprice, txId);
    }

    function getData(bytes32 dataID, bytes32 deviceID)
        external
        view
        returns (string memory)
    {
        return devicesData[deviceID][dataID].uri;
    }

    function getRek(bytes32 deviceID, bytes32 dataID)
        external
        view
        returns (string memory)
    {
        return rek[deviceID][dataID];
    }
}
