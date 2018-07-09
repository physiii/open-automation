const database = require('../database.js'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	PASSWORD_HASH_ALGORITHM = 'sha512',
	PASSWORD_SALT_SIZE = 64,
	XSRF_TOKEN_SIZE = 16;

class Account {
	constructor (data) {
		this.id = data.id;
		this.username = data.username;
		this.password = data.password || data.token; // token is a legacy property.
		this.salt = data.salt;
		this.hash_algorithm = data.hash_algorithm || PASSWORD_HASH_ALGORITHM;
		this.client_sockets = new Map();

		if (data.registration_date) {
			this.registration_date = new Date(data.registration_date);
		}
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

	getClientSockets () {
		return Array.from(this.client_sockets.values());
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

	dbSerialize () {
		return {
			id: this.id,
			username: this.username,
			password: this.password,
			salt: this.salt,
			hash_algorithm: this.hash_algorithm,
			registration_date: this.registration_date
		};
	}

	clientSerialize () {
		return {
			id: this.id,
			username: this.username
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
