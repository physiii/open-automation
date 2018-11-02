const nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	utils = require('../utils.js'),
	AccountsManager = require('../accounts/accounts-manager.js'),
	moment = require('moment'),
	CELL_PROVIDERS = {
		'ATT':'@mms.att.net',
		'TMobile':'@tmomail.net',
		'Verizon':'@vzwpix.com',
		'Sprint':'@pm.sprint.com',
		'VirginMobile':'@vmpix.comm',
		'Tracfone':'@mmst5.tracfone.com',
		'MetroPCS':'@mymetropcs.com',
		'Boost':'@myboostmobile.com',
		'Cricket':'@mms.cricketwireless.net',
		'US_Cellular':'@mms.uscc.net'
	},
	TAG = '[Notifications]';

class Notifications {
	constructor () {
		this.init = this.init.bind(this);
	}

	init () {
		return new Promise((resolve, reject) => {
			if (!process.env.OA_SMTP_HOST || !process.env.OA_SMTP_USER || !process.env.OA_SMTP_PASS) {
				console.log(TAG, 'Mail server is not configured.');
				resolve();

				return;
			}

			this.transporter = nodemailer.createTransport(smtpTransport({
				host: process.env.OA_SMTP_HOST,
				secure: true,
				auth: {
					user: process.env.OA_SMTP_USER,
					pass: process.env.OA_SMTP_PASS
				}
			}));

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
				provider = CELL_PROVIDERS[(recipient.phone_provider || (account && account.phone_provider))],
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
