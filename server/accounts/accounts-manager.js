const database = require('../database.js'),
	Account = require('./account.js'),
	crypto = require('crypto'),
	accounts_list = new Map(),
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

		function errorHandler (error) {
			this._removeAccount(account.id);
			reject(error);
		}

		return new Promise((resolve, reject) => {
			account.setPassword(password).then(() => {
				database.saveAccount(account.dbSerialize()).then((account_id) => {
					// Update the account's ID with the database-generated ID.
					account.id = account_id;

					this._addAccount(account);

					resolve(account);
				}).catch(errorHandler);
			}).catch(errorHandler);
		});
	}

	getAccountById (account_id) {
		let id = account_id;

		if (account_id && account_id.toHexString) {
			id = account_id.toHexString();
		}

		return accounts_list.get(id);
	}

	getAccountByUsername (username) {
		for (let [id, account] of accounts_list) {
			if (account.username.toLowerCase() === username.toLowerCase()) {
				return account;
			}
		}
	}

	isUsernameInUse (username) {
		return Boolean(this.getAccountByUsername(username));
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
