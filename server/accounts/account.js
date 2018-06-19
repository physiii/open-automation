const crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	PASSWORD_HASH_ALGORITHM = 'sha512',
	PASSWORD_SALT_SIZE = 64,
	XSRF_TOKEN_SIZE = 16;

class Account {
	constructor (data) {
		this.id = data._id ? data._id.toHexString() : data.id;
		this.username = data.username;
		this.password = data.password || data.token; // token is a legacy property.
		this.salt = data.salt;
		this.hash_algorithm = data.hash_algorithm || PASSWORD_HASH_ALGORITHM;

		if (data.registration_date) {
			this.registration_date = new Date(data.registration_date);
		}
	}

	setPassword (password) {
		return new Promise((resolve, reject) => {
			this._hashPassword(password).then((password_hash) => {
				this.password = password_hash;
				resolve(this.password);
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
				crypto.randomBytes(PASSWORD_SALT_SIZE, (error, buffer) => {
					if (error) {
						reject(error);

						return;
					}

					this.salt = buffer.toString('hex');

					resolve(this.salt);
				});
			}
		});
	}

	generateAccessToken (issuer, secret) {
		return new Promise((resolve, reject) => {
			this.generateXsrfToken().then((xsrf_token) => {
				jwt.sign(
					{
						xsrf_token
					},
					secret,
					{
						issuer: issuer,
						subject: this.id,
						expiresIn: '1 week'
					},
					(error, access_token) => {
						if (error) {
							reject(error);

							return;
						}

						resolve({access_token, xsrf_token});
					}
				);
			});
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

	dbSerialize () {
		return {
			_id: this.id,
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
