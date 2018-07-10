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
	saveAccount
};

function connect (callback, errorHandler) {
	MongoClient.connect('mongodb://localhost:27017/relay', (error, db) => {
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

				resolve(result.map((account) => {
					const account_temp = {
						...account,
						id: account._id.toHexString()
					};

					delete account_temp._id;

					return account_temp;
				}));
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

					resolve(data.upsertedId ? data.upsertedId._id.toHexString() : data.modifiedCount);
				}, reject);
		});
	});
}
