const mongodb = require('mongodb'),
	ObjectId = mongodb.ObjectID,
	MongoClient = mongodb.MongoClient,
	TAG = '[database.js]';

module.exports = {
	getDevices,
	saveDevice,
	getAccounts,
	saveAccount,
	getAutomations,
	saveAutomation,
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
				(error, record) => {Device
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

function generateId (id) {
	return ObjectId(id);
}
