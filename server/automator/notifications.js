const nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	utils = require('../utils.js'),
	AccountsManager = require('../accounts/accounts-manager.js'),
	moment = require('moment'),
	CELL_PROVIDERS = {
		'AT&T': '@mms.att.net',
		'T-Mobile': '@tmomail.net',
		'Verizon': '@vzwpix.com',
		'Sprint': '@pm.sprint.com',
		'Virgin Mobile': '@vmpix.comm',
		'Tracfone': '@mmst5.tracfone.com',
		'MetroPCS': '@mymetropcs.com',
		'Boost': '@myboostmobile.com',
		'Cricket': '@mms.cricketwireless.net',
		'US Cellular': '@mms.uscc.net'
	},
	CELL_PROVIDER_ALIASES = {
		'ATT': CELL_PROVIDERS['AT&T'],
		'TMobile': CELL_PROVIDERS['T-Mobile'],
		'VirginMobile': CELL_PROVIDERS['Virgin Mobile'],
		'US_Cellular': CELL_PROVIDERS['US Cellular']
	},
	ALL_CELL_PROVIDERS = {
		...CELL_PROVIDERS,
		...CELL_PROVIDER_ALIASES
	},
	TAG = '[Notifications]';

class Notifications {
	constructor () {
		this.init = this.init.bind(this);
	}

	init () {
		return new Promise((resolve, reject) => {
			if ((!process.env.OA_SMTP_HOST && !process.env.OA_SMTP_SERVICE) || !process.env.OA_SMTP_USER || !process.env.OA_SMTP_PASS) {
				console.log(TAG, 'Mail server is not configured.');
				resolve();

				return;
			}

			const smtpConfig = {
				secure: true,
				auth: {
					user: process.env.OA_SMTP_USER,
					pass: process.env.OA_SMTP_PASS
				}
			};

			if (process.env.OA_SMTP_SERVICE) {
				smtpConfig.service = process.env.OA_SMTP_SERVICE;
			} else if (process.env.OA_SMTP_HOST) {
				smtpConfig.host = process.env.OA_SMTP_HOST;
			}

			this.transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
			this.transporter.verify((error, success) => {
				if (error) {
					console.error(TAG, error);
					reject(error);
					return;
				}

				console.log(TAG, 'Mail server is ready to send messages.');
				resolve();
			});
		});
	}

	sendNotification (type, recipient, subject, body, attachments) {
		return new Promise((resolve, reject) => {
			switch (type) {
				case 'email':
					this.sendEmail(recipient, subject, body, attachments).then(resolve).catch((error) => {
						console.error(TAG, error);
						reject(error);
					});

					return;
				case 'sms':
					this.sendText(recipient, subject, body, attachments).then(resolve).catch((error) => {
						console.error(TAG, error);
						reject(error);
					});

					return;
				default:
					const error = 'Notification type must be either "email" or "sms".';

					console.error(TAG, error);
					reject(error);
			}
		});
	}

	sendEmail (recipient, subject, body, attachments) {
		return new Promise((resolve, reject) => {
			let email, html, text;

			if (typeof recipient === 'string') {
				email = recipient;
			} else {
				const account = AccountsManager.getAccountById(recipient.account_id);

				email = recipient.email || (account && account.email);
			}

			if (!email) {
				const error = 'Email address or account ID is required to send an email notification.';

				console.error(TAG, error);
				reject(error);

				return;
			}

			if (typeof body === 'string') {
				html = text = body;
			} else {
				html = '<html><body>' + body.html + '</body></html>';
				text = body.text && utils.stripHtml(body.text);
			}

			const message = {
				from: process.env.OA_SMTP_USER,
				to: email,
				subject,
				html,
				text,
				attachments
			};

			this.transporter.sendMail(message, (error, result) => {
				if (error) {
					console.error(TAG, error);
					reject(error);

					return;
				}

				resolve();
			});
		});
	}

	sendText (recipient, subject, text, attachments) {
		return new Promise((resolve, reject) => {
			const account = AccountsManager.getAccountById(recipient.account_id);
			let phone = recipient.phone_number || (account && account.phone_number),
				provider = ALL_CELL_PROVIDERS[(recipient.phone_provider || (account && account.phone_provider))],
				error;

			if (!phone) {
				error = 'Phone number or account ID is required to send an SMS notification.';
			}

			if (!provider) {
				error = 'Supplied phone provider is not supported.';
			}

			if (error) {
				console.error(TAG, error);
				reject(error);

				return;
			}

			this.sendEmail(phone + provider, subject, text, attachments).then(resolve).catch(reject);
		});
	}
}

module.exports = new Notifications();
