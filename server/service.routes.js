const cookie = require('cookie');
const url = require('url');
const DevicesManager = require('./devices/devices-manager.js'); // adjust path as needed
const TAG = '[service.routes.js]';

module.exports = function (app) {
    app.get('/service-content/camera-preview', (request, response) => {
        const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {};
        const referrer = request.get('Referrer');

        if (referrer && url.parse(referrer).hostname !== process.env.OA_DOMAIN_NAME) {
            return response.sendStatus(401);
        }

        verifyAccessToken(cookies.access_token, request.headers['x-xsrf-token'], true)
            .then(({account}) => {
                const service = DevicesManager.getServiceById(request.query.service_id, account.id);

                if (!service) {
                    return response.sendStatus(204);
                }

                service.getPreviewImage()
                    .then(previewImage => {
                        if (!previewImage) {
                            return response.sendStatus(204);
                        }
                        response.type('jpeg').end(Buffer.from(previewImage, 'base64'));
                    })
					.catch(error => {
						console.log(TAG, 'Error retrieving preview image.', error);
						response.sendStatus(500);
					});
            })
			.catch(error => {
				console.log(TAG, 'Error validating access token.', error);
				response.sendStatus(401);
			});
    });

	app.get('/service-content/*.avi', (request, response) => {
		const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {},
			referrer = request.get('Referrer');

		if (referrer && url.parse(referrer).hostname !== process.env.OA_DOMAIN_NAME) {
			// console.log(TAG, 'URL does not match OA_DOMAIN_NAME in .env file!');
			// response.sendStatus(401);
			// return;
		}

		verifyAccessToken(cookies.access_token, request.headers['x-xsrf-token'], true).then(({account}) => {
			const service = DevicesManager.getServiceById(request.query.service_id, account.id);

			if (!service) {
				response.sendStatus(204);
				return;
			}

			service.getRecording(request.query.recordingId).then((recording) => {
				if (!recording) {
					response.sendStatus(204);
					return;
				}

				response.download(recording);
			}).catch(() => response.sendStatus(500));
		}).catch((error) => {
			console.log(TAG, 'Error validating access token (' + error + ').');
			response.sendStatus(401);
		});
	});

	app.post('/service-content/upload-recording', (req, res) => {
		var fstream;
		req.busboy.on('file', (fieldname, file, filename) => {
			console.log("Uploading:", fieldname, filename);
			fstream = fs.createWriteStream('/tmp/' + fieldname + '_' + filename);
			file.pipe(fstream);
			fstream.on('close', () => {
					console.log("Done Uploading " + filename);
				res.redirect('back');
			});
		});
		req.pipe(req.busboy);
	});
};
