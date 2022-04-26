// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PubSub {
    uint256 private constant SECADAY = 86400;
    mapping(bytes32 => Devices) userDevices; // deviceID to device
    mapping(bytes32 => bool) public usedId; // deviceID to bool
    mapping(bytes32 => mapping(bytes32 => SensorData)) devicesData; // from deviceID to dataID
    mapping(bytes32 =>  mapping(bytes32 => string)) rek; // from deviceID to dataID to  rek
    mapping (address => mapping(address => uint256 [] )) transaction; //from DO to DU to arr of fee
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
    event Subcribe(
        address indexed from,
        address indexed to,
        bytes32 indexed deviceID,
        uint256 txID,
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
        bytes32 [] dataID, 
        uint256 price,
        string pk
    );

    event newData(
        bytes32 indexed deviceID,
        bytes32 indexed dataID,
        uint256 _from,
        uint256 _to,
        string _dataUri,
        string _keyUri
    );
    event NewKey(bytes32 keyID, string uri);

    fallback() external payable {}

    function register(
        bytes32 deviceID,
        string calldata deviceName,
        string calldata _decribe,
        uint256 pricePerDay
    ) external {
        require(!isUsed(deviceID), "PubSub: Id have been used");
        userDevices[deviceID] = Devices(msg.sender,deviceName, _decribe, pricePerDay);
        usedId[deviceID] = true;
        emit Register(msg.sender, deviceID,deviceName, _decribe, pricePerDay);
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
        require(userDevices[deviceID].owner == msg.sender,"PubSub: You are not the owner of this device");
        rek[deviceID][dataID] = keyUri;
        devicesData[deviceID][dataID] = SensorData(true,dataUri, _from, _to);
        emit newData(deviceID, dataID, _from, _to, dataUri,keyUri);
    }

    function updateKey(
        bytes32 deviceID,
        bytes32 dataID,
        string calldata keyUri
    ) public {
        require(userDevices[deviceID].owner == msg.sender,"Pubsub: You are not the owner");
        require(devicesData[deviceID][dataID].isUsed == true,"Pubsub: Data id is not correct");
        rek[deviceID][dataID] = keyUri;
    }

    function subcribe(
        bytes32 deviceID,
        uint256 _from,
        uint256 _to,
        string calldata _pubKey
    ) external payable returns (uint256)  {
        Devices memory device = userDevices[deviceID];
        uint256 price = ((_from - _to) / SECADAY) *
            device.pricePerDay;
        require(msg.value >= price, "Amount is sufficient");
        transaction[device.owner][msg.sender].push(price);
        uint256 txID = transaction[device.owner][msg.sender].length;
        
        payable(this).transfer(price);
        emit Subcribe(
            msg.sender,
            device.owner,
            deviceID,
            txID,
            _from,
            _to,
            price,
            _pubKey
        );
        return txID;
    }

    function buyPackage (bytes32 deviceID, bytes32[] memory dataID, string calldata pk) payable external {
        Devices memory device = userDevices[deviceID];
        uint256 totalprice = calPackagePrice(deviceID,dataID);
        require (msg.value >= totalprice );
        transaction[device.owner][msg.sender].push(totalprice);
        uint256 txID = transaction[device.owner][msg.sender].length;
        emit BuyPackage(msg.sender, device.owner, deviceID, txID, dataID, totalprice, pk);
    }

    function calPackagePrice (bytes32 deviceID, bytes32[] memory dataID) public view returns(uint256){
        Devices memory device = userDevices[deviceID];
        uint256 duration = 0;
        for(uint256 i; i< dataID.length; i=i+1){
            duration += devicesData[deviceID][dataID[i]].to - devicesData[deviceID][dataID[i]].from;
        }
        uint256 price  = duration / SECADAY * device.pricePerDay;
        return price;
    }

    function confirm (bytes32 deviceID, bytes32[] memory dataID, uint256 txID) external{
        Devices memory device = userDevices[deviceID];
        uint256 totalprice = calPackagePrice(deviceID,dataID);
        uint256 expected = transaction[device.owner][msg.sender][txID];
        transaction[device.owner][msg.sender][txID] = expected - totalprice;
    }

    function getData(bytes32 dataID, bytes32 deviceID)
        external
        view
        returns (string memory)
    {
        return devicesData[deviceID][dataID].uri;
    }

    function getRek( bytes32 deviceID, bytes32 dataID) external view returns (string memory) {
        return rek[deviceID][dataID];
    }
}
