const database = require('../database.js'),
	Account = require('./account.js'),
	crypto = require('crypto'),
	accounts_list = new Map(),
	PASSWORD_MINIMUM_LENGTH = 8,
	TAG = 'AccountsManager';

class AccountsManager {
	_addAccount (account) {
		if (!account instanceof Account) {
			console.error(TAG, 'Only instanced of Account can be added to the accounts list.');

			return false;
		}

		accounts_list.set(account.id, account);
	}

	_removeAccount (account_id) {
		accounts_list.delete(account_id);
	}

	createAccount (data) {
		const {password, ...new_account} = data,
			account = new Account({
				registration_date: new Date(),
				...new_account
			});

		return new Promise((resolve, reject) => {
			if (!this.isUsernameValid(data.username)) {
				reject('username');
				return;
			}

			if (!this.isPasswordValid(password)) {
				reject('password');
				return;
			}

			account.setPassword(password).then(() => {
				this._addAccount(account);
				resolve(account);
			}).catch(reject);
		});
	}

	getAccountById (account_id) {
		return accounts_list.get(account_id);
	}

	getAccountByUsername (username) {
		for (let [id, account] of accounts_list) {
			if (account.username.toLowerCase() === username.toLowerCase()) {
				return account;
			}
		}
	}

	isUsernameValid (username) {
		if (!username || username.length < 1) {
			return false;
		}

		return !Boolean(this.getAccountByUsername(username));
	}

	isPasswordValid (password) {
		return typeof password === 'string' && password.length >= PASSWORD_MINIMUM_LENGTH;
	}

	loadAccountsFromDb () {
		return new Promise((resolve, reject) => {
			database.getAccounts().then((accounts) => {
				accounts_list.clear();
				accounts.forEach((account) => this._addAccount(new Account(account)));
			});
		});
	}
}

module.exports = new AccountsManager();
