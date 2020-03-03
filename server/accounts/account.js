const database = require('../database.js'),
	RoomsList = require('../locations/rooms-list.js'),
	DevicesManager = require('../devices/devices-manager.js'),
	utils = require('../utils.js'),
	EventEmitter = require('events'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	PASSWORD_HASH_ALGORITHM = 'sha512',
	PASSWORD_SALT_SIZE = 64,
	XSRF_TOKEN_SIZE = 16,
	TAG = '[Account]';

class Account extends EventEmitter {
	constructor (data) {
		super();

		this.id = data.id;
		this.username = data.username;
		this.password = data.password;
		this.salt = data.salt;
		this.hash_algorithm = data.hash_algorithm || PASSWORD_HASH_ALGORITHM;
		this.email = data.email || utils.isEmail(this.username) ? this.username : undefined;
		this.phone_number = data.phone_number;
		this.phone_provider = data.phone_provider;
		this.armed = data.armed || 0;

		if (data.registration_date) {
			this.registration_date = new Date(data.registration_date);
		}

		this.rooms = new RoomsList(data.rooms, this._saveRooms.bind(this));
		this.rooms.on('rooms-updated', (data) => this.emit('rooms-updated', data));
	}

	setPassword (password) {
		return new Promise((resolve, reject) => {
			this._hashPassword(password).then((password_hash) => {
				this.password = password_hash;
				this.save().then(() => {
					resolve();
				}).catch(reject);
			}).catch(reject);
		});
	}

	isCorrectPassword (password) {
		return new Promise((resolve, reject) => {
			this._hashPassword(password).then((password_hash) => {
				if (password_hash === this.password) {
					resolve(true);
				} else {
					resolve(false);
				}
			}).catch(reject);
		});
	}

	getPasswordSalt () {
		return new Promise((resolve, reject) => {
			if (this.salt) {
				resolve(this.salt);
			} else {
				crypto.randomBytes(PASSWORD_SALT_SIZE, (error, salt_buffer) => {
					if (error) {
						reject(error);

						return;
					}

					this.salt = salt_buffer.toString('hex');

					resolve(this.salt);
				});
			}
		});
	}

	generateAccessToken (issuer, secret) {
		return new Promise((resolve, reject) => {
			Promise.all([
				this.generateXsrfToken(),
				this.generateRefreshToken()
			]).then(([xsrf_token, refresh_token]) => {
				jwt.sign(
					{
						xsrf_token,
						refresh_token
					},
					secret,
					{
						issuer,
						subject: this.id,
						expiresIn: '3 days'
					},
					(error, access_token) => {
						if (error) {
							reject(error);

							return;
						}

						resolve({access_token, xsrf_token});
					}
				);
			}).catch(reject);
		});
	}

	generateXsrfToken () {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(XSRF_TOKEN_SIZE, (error, token_buffer) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(token_buffer.toString('hex'));
			});
		});
	}

	generateRefreshToken () {
		// Re-hash hashed password to serve as refresh token. If the account's
		// password is changed, it will invalidate the refresh token.
		return this._hashPassword(this.password);
	}

	verifyRefreshToken (refresh_token) {
		return new Promise((resolve, reject) => {
			this.generateRefreshToken().then((valid_refresh_token) => {
				resolve(refresh_token === valid_refresh_token);
			}).catch(reject);
		});
	}

	setArmed (mode) {
		return new Promise((resolve, reject) => {
			if (mode !== 0 && mode !== 1 && mode !== 2) {
				reject('mode must be 0, 1, or 2.');

				return;
			}

			const previous_mode = this.armed;

			this.armed = mode;
			this.save().then(() => {
				DevicesManager.emitEventToAccountDevices(this.id, 'armed-state', {mode});

				resolve(this.armed);
			}).catch((error) => {
				this.armed = previous_mode;

				reject(error);
			});
		});
	}

	_saveRooms (rooms) {
		return new Promise((resolve, reject) => {
			database.saveRooms(this.id, rooms).then((saved_rooms) => resolve(saved_rooms));
		});
	}

	save () {
		return new Promise((resolve, reject) => {
			database.saveAccount(this.dbSerialize()).then((account_id) => {
				// Update the account's ID with the database-generated ID.
				if (!this.id) {
					this.id = account_id;
				}

				resolve(account_id);
			}).catch(reject);
		});
	}

	_serialize () {
		return {
			id: this.id,
			username: this.username,
			email: this.email,
			armed: this.armed
		};
	}

	dbSerialize () {
		return {
			...this._serialize(),
			password: this.password,
			salt: this.salt,
			hash_algorithm: this.hash_algorithm,
			phone_number: this.phone_number,
			phone_provider: this.phone_provider,
			registration_date: this.registration_date,
			rooms: this.rooms.dbSerialize()
		};
	}

	clientSerialize () {
		return {
			...this._serialize(),
			rooms: this.rooms.clientSerialize()
		};
	}

	_hashPassword (password) {
		return new Promise((resolve, reject) => {
			this.getPasswordSalt().then((salt) => {
				try {
					resolve(crypto.createHash(this.hash_algorithm).update(password + salt).digest('hex'));
				} catch (error) {
					reject(error);
				}
			}).catch(reject);
		});
	}
}

module.exports = Account;
