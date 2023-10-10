const mongodb = require('mongodb'),
	ObjectId = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient,
	DATABASE_NAME = process.env.OA_DATABASE_COLLECTION_NAME || 'relay',
	TAG = '[database.js]';

class Database {

constructor () {
		this.client = null;
		this.client = this.connect((client) => {
			this.client = client;
		});
}

connect(callback, errorHandler) {
	if (this.client) return callback(this.client);

	const options = {
			useUnifiedTopology: true
	};

	MongoClient.connect('mongodb://127.0.0.1:27017/', options, (error, client) => {
			if (error) {
					console.error(TAG, 'Unable to connect to the mongoDB server.', error);

					if (typeof errorHandler === 'function') {
							errorHandler(error);
					}

					return;
			}

			callback(client);
	});
}

getDevices () {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			// Find only devices that have an "id" property to filter out any leftover OA1 devices.
			client.db(DATABASE_NAME).collection('devices').find({id: {$exists: true}}).toArray((error, result) => {
				// client.close();

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

getDevice (device_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('devices').find({id: device_id}).toArray((error, result) => {
				// client.close();

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

getDeviceLog (device_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('logs').find({id: device_id}).toArray((error, result) => {
				// client.close();

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

saveLog (log) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('logs').insertOne(log, (error, record) => {
				// client.close();

				if (error) {
					console.error(TAG, 'saveLog', error);
					reject('Database error');
					return;
				}

				resolve(record);
			});
		});
	});
}

saveDevice (device) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('devices').update(
				{id: device.id},
				{$set: device},
				{upsert: true},
				(error, record) => {
					// client.close();

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

deleteDevice (device_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('devices').remove({id: device_id}, (error) => {
				// client.close();

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

getAccounts () {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('accounts').find().toArray((error, result = []) => {
				// client.close();

				if (error) {
					console.error(TAG, 'getAccounts', error);
					reject(error);

					return;
				}

				// Stringify MongoDB IDs.
				result.forEach((account) => {
					account.id = account._id.toHexString();

					if (Array.isArray(account.rooms)) {
						account.rooms = this.convertRoomObjectIdsToStrings(account.rooms);
					}

					delete account._id;
				});

				resolve(result);
			}, reject);
		});
	});
}

saveAccount (account) {
	const account_id = account.id;

	delete account.id;

	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('accounts').updateOne(
				{_id: ObjectId(account_id)},
				{$set: account},
				{upsert: true},
				(error, data) => {
					// client.close();

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

updateAccountPassword (accountId, hashedPassword) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('accounts').updateOne(
				{_id: ObjectId(accountId)},
				{$set: {password: hashedPassword}},
				(error, data) => {
					// client.close();

					if (error) {
						console.error(TAG, 'updateAccountPassword', error);
						reject(error);

						return;
					}

					if (data.matchedCount === 0) {
						reject(new Error('No account found with the given ID.'));
						return;
					}

					resolve();
				}
			);
		});
	});
}

convertRoomIdsToObjectIds (rooms = []) {
	return rooms.map((room) => ({
		...room,
		id: ObjectId(room.id)
	}));
}

convertRoomObjectIdsToStrings (rooms = []) {
	return rooms.map((room) => ({
		...room,
		id: room.id && room.id.toHexString
			? room.id.toHexString()
			: (room.id ? room.id : ObjectId(room.id))
	}));
}

saveRooms (account_id, rooms = []) {
	return new Promise((resolve, reject) => {
		if (!Array.isArray(rooms)) {
			reject('Rooms must be an array.');
			return;
		}

		// TODO: Atomically remove the room ID from devices for rooms that were deleted.

		this.connect((client) => {
			client.db(DATABASE_NAME).collection('accounts').updateOne(
				{_id: ObjectId(account_id)},
				{$set: {rooms: convertRoomIdsToObjectIds(rooms)}},
				// {upsert: true},
				(error, data) => {
					// client.close();

					if (error) {
						console.error(TAG, 'saveRooms', error);
						reject(error);

						return;
					}

					resolve(this.convertRoomObjectIdsToStrings(rooms));
				}, reject);
		});
	});
}

getAutomations () {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('automations').find().toArray((error, result) => {
				// client.close();

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

saveAutomation (automation) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('automations').update(
				{id: automation.id},
				{$set: automation},
				{upsert: true},
				(error, record) => {
					// client.close();

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

deleteAutomation (automation_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('automations').remove({id: automation_id}, (error) => {
				// client.close();

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

getScenes () {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('scenes').find().toArray((error, result) => {
				// client.close();

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

saveScene (scene) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('scenes').update(
				{id: scene.id},
				{$set: scene},
				{upsert: true},
				(error, record) => {
					// client.close();

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

get_camera_recordings (camera_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			let query = {};

			if (camera_id) {
				query = {camera_id: camera_id};
			}

			client.db(DATABASE_NAME).collection('camera_recordings').find(query).toArray(
				(error, recordings) => {
					// client.close();

					if (error) {
						console.error(TAG, 'set_camera_recording', error);
						reject(error);
						return;
					}

					resolve(recordings);
				}, reject);
		});
	});
}

get_camera_recording_DEL (recording_id) {
	return this.connect((db, resolve, reject) => {
		client.db(DATABASE_NAME).collection('camera_recordings').find({id: recording_id}).toArray((error, result) => {
			// client.close();

			if (error) {
				console.error(TAG, 'get_camera_recording', error);
				reject('Database error');
				return;
			}

			resolve(result[0]);
		});
	});
}

get_camera_recording (recording_id) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('camera_recordings').find({id: recording_id}).toArray((error, result) => {
					// client.close();

					if (error) {
						console.error(TAG, 'get_camera_recording', error);
						reject(error);
						return;
					}

					resolve(result[0]);
				}, reject);
		});
	});
}

set_camera_recording (data) {
	return new Promise((resolve, reject) => {
		this.connect((client) => {
			client.db(DATABASE_NAME).collection('camera_recordings').insertOne(
				data,
				(error, record) => {
					// client.close();

					if (error) {
						console.error(TAG, 'set_camera_recording', error);
						reject(error);
						return;
					}

					resolve(record);
				}, reject);
		});
	});
}

delete_camera_recording (recording_id) {
	return this.connect((db, resolve, reject) => {
		db.collection('camera_recordings').remove({id: recording_id}, (error, result) => {
			db.close();

			if (error) {
				console.error(TAG, 'delete_camera_recording', error);
				reject('Database error');
				return;
			}

			resolve(result);
		});
	});
}
}

module.exports = new Database();
