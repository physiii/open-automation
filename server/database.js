const mongodb = require('mongodb'),
	ObjectId = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient,
	TAG = '[database.js]';

module.exports = {
	getDevices,
	getDevice,
	saveDevice,
	deleteDevice,
	getAccounts,
	saveAccount,
	saveRooms,
	getAutomations,
	saveAutomation,
	deleteAutomation,
	getScenes,
	saveScene
};

function connect (callback, errorHandler) {
	MongoClient.connect('mongodb://localhost:27017/' + (process.env.OA_DATABASE_COLLECTION_NAME || 'relay'), (error, db) => {
		if (error) {
			console.error(TAG, 'Unable to connect to the mongoDB server.', error);

			if (typeof errorHandler === 'function') {
				errorHandler(error);
			}

			return;
		}

		callback(db);
	});
}

function getDevices () {
	return new Promise((resolve, reject) => {
		connect((db) => {
			// Find only devices that have an "id" property to filter out any leftover OA1 devices.
			db.collection('devices').find({id: {$exists: true}}).toArray((error, result) => {
				db.close();

				if (error) {
					console.error(TAG, 'getDevices', error);
					reject(error);

					return;
				}

				resolve(result);
			});
		}, reject);
	});
}

function getDevice (device_id) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('devices').find({id: device_id}).toArray((error, result) => {
				db.close();

				if (error) {
					console.error(TAG, 'getDevice', error);
					reject(error);

					return;
				}

				resolve(result);
			});
		}, reject);
	});
}

function saveDevice (device) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('devices').update(
				{id: device.id},
				{$set: device},
				{upsert: true},
				(error, record) => {
					db.close();

					if (error) {
						console.error(TAG, 'saveDevice', error);
						reject(error);

						return;
					}

					resolve(record);
				}, reject);
		});
	});
}

function deleteDevice (device_id) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('devices').remove({id: device_id}, (error) => {
				db.close();

				if (error) {
					console.error(TAG, 'deleteDevice', error);
					reject(error);

					return;
				}

				resolve();
			}, reject);
		});
	});
}

function getAccounts () {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('accounts').find().toArray((error, result = []) => {
				db.close();

				if (error) {
					console.error(TAG, 'getAccounts', error);
					reject(error);

					return;
				}

				// Stringify MongoDB IDs.
				result.forEach((account) => {
					account.id = account._id.toHexString();

					if (Array.isArray(account.rooms)) {
						account.rooms = convertRoomObjectIdsToStrings(account.rooms);
					}

					delete account._id;
				});

				resolve(result);
			}, reject);
		});
	});
}

function saveAccount (account) {
	const account_id = account.id;

	delete account.id;

	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('accounts').updateOne(
				{_id: ObjectId(account_id)},
				{$set: account},
				{upsert: true},
				(error, data) => {
					db.close();

					if (error) {
						console.error(TAG, 'saveAccount', error);
						reject(error);

						return;
					}

					resolve(data.upsertedId ? data.upsertedId._id.toHexString() : account_id);
				}, reject);
		});
	});
}

function convertRoomIdsToObjectIds (rooms = []) {
	return rooms.map((room) => ({
		...room,
		id: ObjectId(room.id)
	}));
}

function convertRoomObjectIdsToStrings (rooms = []) {
	return rooms.map((room) => ({
		...room,
		id: room.id.toHexString
			? room.id.toHexString()
			: room.id
	}));
}

function saveRooms (account_id, rooms = []) {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(rooms)) {
			reject('Rooms must be an array.');
			return;
		}

		// TODO: Atomically remove the room ID from devices for rooms that were deleted.

		connect((db) => {
			db.collection('accounts').updateOne(
				{_id: ObjectId(account_id)},
				{$set: {rooms: convertRoomIdsToObjectIds(rooms)}},
				// {upsert: true},
				(error, data) => {
					db.close();

					if (error) {
						console.error(TAG, 'saveRooms', error);
						reject(error);

						return;
					}

					resolve(convertRoomObjectIdsToStrings(rooms));
				}, reject);
		});
	});
}

function getAutomations () {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('automations').find().toArray((error, result) => {
				db.close();

				if (error) {
					console.error(TAG, 'getAutomations', error);
					reject(error);

					return;
				}

				resolve(result);
			});
		}, reject);
	});
}

function saveAutomation (automation) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('automations').update(
				{id: automation.id},
				{$set: automation},
				{upsert: true},
				(error, record) => {
					db.close();

					if (error) {
						console.log(TAG, 'saveAutomation', error);
						reject(error);

						return;
					}

					resolve(record);
				}, reject);
		});
	});
}

function deleteAutomation (automation_id) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('automations').remove({id: automation_id}, (error) => {
				db.close();

				if (error) {
					console.error(TAG, 'deleteAutomation', error);
					reject(error);

					return;
				}

				resolve();
			}, reject);
		});
	});
}

function getScenes () {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('scenes').find().toArray((error, result) => {
				db.close();

				if (error) {
					console.error(TAG, 'getScenes', error);
					reject(error);

					return;
				}

				resolve(result);
			});
		}, reject);
	});
}

function saveScene (scene) {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('scenes').update(
				{id: scene.id},
				{$set: scene},
				{upsert: true},
				(error, record) => {
					db.close();

					if (error) {
						console.log(TAG, 'saveScene', error);
						reject(error);

						return;
					}

					resolve(record);
				}, reject);
		});
	});
}
