const nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	config = require('../../config.json'),
	moment = require('mnoment'),
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
	TAG = '[Notifications.js]';


class Notifications {
	constructor () {
		this.mailOptions = {};
		this.email = config.smtp_transport.auth.user;
		this.init();
	}

	init () {
		this.transporter = nodemailer.createTransport(smtpTransport(config.smtp_transport));

		this.transporter.verify(function(error, success) {
			if (error) {
				console.log(error);
			} else {
				console.log('Server is ready to take our messages');
			}
		});
	}

	sendNotification (data, notification, account_id) {
		switch (notification.type) {
			case 'email':
				this.sendEmail(notification);
				break;
			case 'sms':
				this.sendText(notification);
				break;
			case 'motion':
				this.alertBuild(data).then((recording)=>{
					this.sendImageAlert(recording, notification);
				}).catch((err) => {
					console.log(err);
				});
				break;
			default:
				break;
		}
	}

	alertBuild(data = {}) {
		return new Promise ((resolve,reject) => {
			if (!data) {
				reject('No Data for alert');
			}

			const file_path = config.domain_name
			 	+ ':'
			 	+ config.website_port.toString()
			 	+ '/dashboard/recordings/'
			 	+ data.recording.camera_id
				+ moment().format('/YYYY/MM/DD/')
			 	+ data.recording.id,
				results = {
			 	preview_img: data.image,
			 	timestamp: data.time,
			 	html: '<a href=\"'
								+ file_path
								+'\" target="_blank" style="font-size:20px;">Click here to Play Video</a>'
			};

			resolve(results);
		})
	}


	sendEmail (notification) {
		this.mailOptions = {
			from: this.email,
			to: notification.email,
			subject: notification.subject,
			html: notification.message
		};

		this.transporter.sendMail(this.mailOptions, (error) => {
			if (error) {
				console.log(error);
			}
		});
	}

	sendText (notification) {
		this.mailOptions = {
			from: this.email,
			to: notification.number + CELL_PROVIDERS[notification.provider],
			subject: notification.subject,
			text: notification.message
		};

		this.transporter.sendMail(this.mailOptions, (error) => {
			if (error) {
				console.log(error);
			}
		});

	}

	sendMotionAlert (data, notification) {
		this.mailOptions = {
			from: this.email,
			to: notification.email,
			subject: '!Notification Alert: Motion detected ' + data.timestamp + '.',
			html: data.html//,
			//attachments: data.attachments
		};

		this.transporter.sendMail(this.mailOptions, (error) => {
			if (error) {
				console.log(error);
			}
		});

	}
}

module.exports = new Notifications();

/*
	Legacy API - DEPRECATED

	socket.on('DEPRECATED motion detected', function (data) {
		console.log('motion detected', data.toString());
		if (!motionStarted) {
			motionStarted = true;
			var mailOptions = {
				from: config.mail.from_user,
				to: config.mail.to_user,
				subject: 'Motion Detected',
				text: data.toString()
			};

			if (transporter) {
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			}
		}
	});

	socket.on('DEPRECATED motion stopped', function (data) {
		console.log('motion stopped', data.toString());
		if (motionStarted) {
			motionStarted = false;
			var mailOptions = {
				from: config.mail.from_user,
				to: config.mail.to_user,
				subject: 'Motion Stopped',
				text: data.toString()
			};

			if (transporter) {
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			}
		}
	});
	*/
