const mongodb = require('mongodb'),
	ObjectId = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient,
	TAG = '[database.js]';

module.exports = {
	getDevices,
	saveDevice,
	getAccounts,
	saveAccount,
	generateId
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
			db.collection('devices').find().toArray((error, result) => {
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
						console.log(TAG, 'saveDevice', error);
						reject(error);

						return;
					}

					resolve(record);
				}, reject);
		});
	});
}

function getAccounts () {
	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('accounts').find().toArray(function (error, result) {
				db.close();

				if (error) {
					console.log(TAG, 'getAccounts', error);
					reject(error);

					return;
				}

				resolve(result);
			}, reject);
		});
	});
}

function saveAccount (account) {
	const account_temp = {...account};

	delete account_temp.socket;

	// Delete undefined _id property so MongoDB will assign an id.
	if (!account_temp._id) {
		delete account_temp._id;
	}

	return new Promise((resolve, reject) => {
		connect((db) => {
			db.collection('accounts').updateOne(
				{_id: ObjectId(account_temp._id)},
				{$set: account_temp},
				{upsert: true},
				(error, data) => {
					db.close();

					if (error) {
						console.error(TAG, 'saveAccount', error);
						reject(error);

						return;
					}

					resolve(data.result.upserted[0]._id.toHexString());
				}, reject);
		});
	});
}

function generateId (id) {
	return ObjectId(id);
}
