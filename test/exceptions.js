const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise, message) {
	try {
		await promise;
		throw null;
	} catch (error) {
		assert.isNotNull(error, "Expected an error but did not get one");
		assert.equal(error.message.startsWith(PREFIX + message), 1, "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
	}
}

async function tryCatchNoReason(promise) {
	try {
		await promise;
		throw null;
	} catch (error) {
		assert.isNotNull(error, "Expected an error but did not get one");
	}
}

module.exports = {
	catchRevertReason: async function (promise, reason) {
		await tryCatch(promise, "revert " + reason);
	},
	tryCatchNoReason: async function (promise, reason) {
		await tryCatchNoReason(promise);
	},
	catchRevert: async function (promise) {
		await tryCatch(promise, "revert");
	},
	catchOutOfGas: async function (promise) {
		await tryCatch(promise, "out of gas");
	},
	catchInvalidJump: async function (promise) {
		await tryCatch(promise, "invalid JUMP");
	},
	catchInvalidOpcode: async function (promise) {
		await tryCatch(promise, "invalid opcode");
	},
	catchStackOverflow: async function (promise) {
		await tryCatch(promise, "stack overflow");
	},
	catchStackUnderflow: async function (promise) {
		await tryCatch(promise, "stack underflow");
	},
	catchStaticStateChange: async function (promise) {
		await tryCatch(promise, "static state change");
	},
};
