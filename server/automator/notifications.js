const nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	config = require('../../config.json'),
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

	sendNotification (event_data, notification, account_id) {
		switch (notification.type) {
			case 'email':
				this.sendEmail(notification);
				break;
			case 'sms':
				this.sendText(notification);
				break;
			case 'motion-recorded':
				this.alertBuild(event_data).then((recording)=>{
					this.sendMotionAlert(recording, notification);
				}).catch((err) => {
					console.log(err);
				});
				break;
			default:
				break;
		}
	}

	alertBuild(event_data = {}) {
		return new Promise ((resolve,reject) => {
			if (!event_data) {
				reject('No Data for alert');
			}

			const file_path = config.domain_name
			 	+ ':'
			 	+ config.website_port.toString()
			 	+ '/dashboard/recordings/'
			 	+ event_data.recording.camera_id
				+ moment().format('/YYYY/MM/DD/')
			 	+ event_data.recording.id,
				results = {
			 	preview_img: 'data:image/jpg;base64,' + event_data.image,
			 	timestamp: event_data.time,
			 	html: '<a href=\"http://'
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

	sendMotionAlert (recording, notification) {
		this.mailOptions = {
			from: this.email,
			to: notification.email,
			subject: '!Notification Alert: Motion detected ' + recording.time + '.',
			html: recording.html + '<br>' +  '<img src="cid:preview_img1"/>' + '<br>',
			attachments: [
				{
					filename: 'Preview_Image.jpg',
					content: new Buffer(recording.preview_img.split("base64,")[1], "base64"),
					cid: 'preview_img1'
				}
			]
		};

		this.transporter.sendMail(this.mailOptions, (error) => {
			if (error) {
				console.log(error);
			}
		});

	}
}

module.exports = new Notifications();
