function subRegister(event_func) {
  contract.events
    .Register({ fromBlock: 0 }, function (error, event) {
      console.log(event);
    })
    .on("data", event_func);
  // .on("connected", function (subscriptionId) {
  // 	console.log(subscriptionId);
  // })
  // .on("data", function (event) {
  // 	console.log(event); // same results as the optional callback above
  // });
}

function subPub() {
  return contract.events.newData({}, function (error, event) {
    console.log(event);
  });
  // .on("connected", function (subscriptionId) {
  // 	console.log(subscriptionId);
  // })
  // .on("data", function (event) {
  // 	console.log(event); // same results as the optional callback above
  // });
}
