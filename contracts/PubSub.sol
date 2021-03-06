// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PubSub {
    uint256 private constant MISECDAY = 86400000;

    mapping(bytes32 => Devices) userDevices; // deviceID to device

    mapping(bytes32 => bool) public usedId; // deviceID to bool

    mapping(bytes32 => mapping(bytes32 => SensorData)) devicesData; // from deviceID to dataID

    mapping(bytes32 => mapping(bytes32 => string)) rek; // from deviceID to dataID to  rek

    mapping (bytes32 => string) updatedKey; //txID to keyUri

    mapping(address => mapping(address => mapping(bytes32 => uint256))) transactionList; // from DO to DU to transactionID to amount
    
    struct Devices {
        address owner;
        string name;
        string describe;
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
        string _describe,
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
    
    event NewData(
        bytes32 indexed deviceID,
        bytes32 indexed dataID,
        uint256 _from,
        uint256 _to,
        string _dataUri,
        string _keyUri
    );

    event NewKey(
        address to,
        bytes32 txID,
        string keyUri
    );

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
        string calldata _describe,
        uint256 pricePerDay
    ) external {
        require(!isUsed(deviceID), "PubSub: Id have been used");
        userDevices[deviceID] = Devices(
            msg.sender,
            deviceName,
            _describe,
            pricePerDay
        );
        usedId[deviceID] = true;
        emit Register(msg.sender, deviceID, deviceName, _describe, pricePerDay);
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
        require(_from < _to,"Pubsub: from must smaller than to");
        require(_to/1000 <= block.timestamp,"Pubsub: to must smaller than current time");
        require(devicesData[deviceID][dataID].isUsed == false, "Duplicate data ID");
        rek[deviceID][dataID] = keyUri;
        devicesData[deviceID][dataID] = SensorData(true, dataUri, _from, _to);
        emit NewData(deviceID, dataID, _from, _to, dataUri, keyUri);
    }

    function updateKey(
        bytes32 deviceID,
        bytes32 txID,
        address to,
        string calldata keyUri
    ) public {
        require(
            userDevices[deviceID].owner == msg.sender,
            "Pubsub: You are not the owner"
        );
        require(transactionList[msg.sender][to][txID] != 0, "PubSub: Transaction not exist");
        updatedKey[txID] = keyUri;
        emit NewKey(to, txID, keyUri);
    }

    function subscribe(
        bytes32 deviceID,
        uint256 _from,
        uint256 _to,
        string calldata _pubKey
    ) external payable returns (bytes32) {
        require(userDevices[deviceID].owner != msg.sender, "Pubsub: can not subscribe to your own device");
        require(
            userDevices[deviceID].owner != address(0x0),
            "Pubsub: device is not registered yet"
        );
        require(_from < _to, "Pubsub: end time much larger than begin time");
        Devices memory device = userDevices[deviceID];
        uint256 price = ((_to - _from) / MISECDAY) * device.pricePerDay;
        require(msg.value >= price, "Amount is sufficient");
        
        bytes32 txId = keccak256(
            abi.encodePacked(msg.sender, device.owner, _from,_to )
        );
        transactionList[device.owner][msg.sender][txId] = price;
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

    function calPackagePrice(bytes32 deviceID, bytes32[] calldata dataID)
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
        uint256 price = (duration / MISECDAY) * device.pricePerDay;
        return price;
    }

    function calPackagePrice2(bytes32 deviceID, bytes32[] calldata dataID)
        public
        view
        returns (uint256,uint256)
    {
        Devices memory device = userDevices[deviceID];
        uint256 duration = 0;
        for (uint256 i; i < dataID.length; i = i + 1) {
            duration +=
                devicesData[deviceID][dataID[i]].to -
                devicesData[deviceID][dataID[i]].from;
        }
        uint256 price = (duration / MISECDAY) * device.pricePerDay;
        return (price,duration);
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
        payable(device.owner).transfer(totalprice);
        emit Confirm(msg.sender, device.owner, dataID, totalprice, txId);
    }

    function getData(bytes32 dataID, bytes32 deviceID)
        external
        view
        returns (SensorData memory)
    {
        return devicesData[deviceID][dataID];
    }

    function getRek(bytes32 deviceID, bytes32 dataID)
        external
        view
        returns (string memory)
    {
        return rek[deviceID][dataID];
    }

    function getTx(address requester, address owner,uint256 from,uint256 to) pure public returns (bytes32) {
        return keccak256(
            abi.encodePacked(requester, owner, from,to )
        );
    }

    function getDevice(bytes32 deviceID) external view returns  (Devices memory) {
        return userDevices[deviceID];
    }
}
