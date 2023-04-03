const
	AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	database = require('./database.js'),
	uuid = require('uuid/v4'),
	express = require('express'),
	bodyParser = require('body-parser'),
	busboy = require('connect-busboy'),
	cookie = require('cookie'),
	path = require('path'),
	fs = require('fs'),
	Exec = require('child_process').exec,
	ExecSync = require('child_process').execSync,
	SpawnSync = require('child_process').spawnSync,
	// streamDir = '/usr/local/lib/open-automation/stream/',
	tmpDir = '/tmp/open-automation',
	streamDir = tmpDir + '/stream/',
	recordingsDir = '/usr/local/lib/open-automation/recording/',
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	compression = require('compression'),
	helmet = require('helmet'),
	jwt = require('jsonwebtoken'),
	url = require('url'),
	webpack = require('webpack'),
	WebpackDevMiddleware = require('webpack-dev-middleware'),
	WebpackHotMiddleware = require('webpack-hot-middleware'),
	getWebpackConfig = require('../webpack.config'),
	MILLISECONDS_PER_SECOND = 1000,
	util = require('node:util'),
	os = require('node:os'),
	formidable = require('formidable'),
	HLS_TIME = 10,
	TAG = '[website.js]';

module.exports = function (jwt_secret) {
	fs.rmSync(tmpDir, { recursive: true, force: true }, (err) => {});
	fs.mkdirSync(streamDir, { recursive: true });

	const app = express();
		do_hot_module_replacement = process.env.OA_HOT_MODULE_REPLACEMENT && process.env.NODE_ENV === 'development',
		helmet_options = {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ['\'self\''], // Only allow loading assets from same origin.
					scriptSrc: ['\'self\''],
					styleSrc: ['\'self\''],
					connectSrc: [
						'\'self\'',
						(process.env.OA_SSL ? 'wss' : 'ws') + '://' + process.env.OA_DOMAIN_NAME
					]
				}
			},
			crossdomain: {
				permittedPolicies: 'none' // Prevent clients like Flash and Acrobat from loading the site.
			},
			frameguard: {
				action: 'deny' // Prevent the site from being loaded in a frame.
			}
		},
		verifyAccessToken = (access_token, xsrf_token, skip_xsrf) => {
			return new Promise((resolve, reject) => {
				if (!access_token) {
					reject('No access token');
					return;
				}

				jwt.verify(access_token, jwt_secret, {issuer: process.env.OA_API_TOKEN_ISSUER}, (error, claims) => {
					// Access token is invalid.
					if (error) {
						reject('Invalid access token ' + error.name);
						return;
					}

					// Access token or CSRF token is invalid.
					if (!skip_xsrf && xsrf_token !== claims.xsrf_token) {
						reject('Invalid XSRF token');
						return;
					}

					const account = AccountsManager.getAccountById(claims.sub);

					if (!account) {
						reject('Account not found');
						return;
					}

					// Get the account for the account ID provided by the access token.
					resolve({
						account,
						refresh_token: claims.refresh_token
					});
				});
			});
		};

	let logo_file_path = process.env.OA_LOGO_PATH || 'logo.png',
		webpack_compiler;

	try {
		fs.accessSync(__dirname + '/../public/' + logo_file_path);
	} catch (error) {
		logo_file_path = false;
	}

	// Set up webpack middleware (for automatic compiling/hot reloading).
	if (do_hot_module_replacement) {
		const webpack_config = getWebpackConfig({dev_middleware: true});

		webpack_compiler = webpack(webpack_config);

		app.use(WebpackDevMiddleware(webpack_compiler, {
			publicPath: webpack_config.output.publicPath,
			stats: webpack_config.stats,
			logLevel: 'warn',
			logTime: true
		}));

		app.use(WebpackHotMiddleware(webpack_compiler));
	}

	// Loosen security policies in development to support webpack development mode and hot module reloading.
	if (process.env.NODE_ENV === 'development') {
		helmet_options.contentSecurityPolicy.directives.scriptSrc.push('\'unsafe-eval\'');
		helmet_options.contentSecurityPolicy.directives.scriptSrc.push('\'unsafe-inline\'');
		helmet_options.contentSecurityPolicy.directives.styleSrc.push('\'unsafe-inline\'');
		helmet_options.contentSecurityPolicy.directives.styleSrc.push('blob:');
		helmet_options.hsts = false;
	}

	app.use(busboy());


	app.use(bodyParser.json({ limit: "500mb" }))
	app.use(express.urlencoded({limit: '500mb', extended: true, parameterLimit: 50000}));

	// Set security HTTP headers.
	// app.use(helmet(helmet_options));

	// Support JSON encoded bodies.
	app.use(bodyParser.json());

	// Support encoded bodies.
	app.use(bodyParser.urlencoded({extended: true}));

	// Support gzip and deflate.
	app.use(compression());

	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.use(new LocalStrategy((username, password, done) => {
		const account = AccountsManager.getAccountByUsername(username);

		if (!account) {
			console.log(TAG, 'Login ' + username + ': account not found.');
			return done(null, false);
		}

		account.isCorrectPassword(password).then((is_correct) => {
			if (!is_correct) {
				console.log(TAG, 'Login ' + username + ': incorrect password.');
				return done(null, false);
			}

			// Password is correct.
			return done(null, account);
		}).catch(() => {
			return done(null, false);
		});
	}));

	app.use('/', express.static(__dirname + '/../public'));

	app.use('/stream', express.static(streamDir, {
		setHeaders: function(res, path, stat) {
			if (path.indexOf(".ts") > -1) {
					res.set("cache-control", "public, max-age=300");
			}
		}
	}));

	app.use('/recording', express.static('/usr/local/lib/open-automation/recording', {
		setHeaders: function(res, path, stat) {
			if (path.indexOf(".ts") > -1) {
					res.set("cache-control", "public, max-age=300");
			}
		}
	}));

	app.get('/get_ip', (request, response) => {
		let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

		ip = ip.split(':');
		ip = ip[ip.length - 1];

		response.send(ip);
	});

	app.post('/api/token', (request, response, next) => {
		function respondWithAccessToken (account) {
			// Generate access token and CSRF token.
			account.generateAccessToken(process.env.OA_API_TOKEN_ISSUER, jwt_secret).then((tokens) => {
				// Store the access token in a cookie on client. This cookie
				// MUST be set to HttpOnly; and Secure; (if SSL is configured)
				// to protect against certain XSS and MITM attacks.
				response.setHeader('Set-Cookie', 'access_token=' + tokens.access_token + '; path=/; HttpOnly;' + (process.env.OA_SSL ? ' Secure;' : ''));

				response.json({
					account: account.clientSerialize(),
					xsrf_token: tokens.xsrf_token,
					access_token_expires: jwt.decode(tokens.access_token).exp * MILLISECONDS_PER_SECOND
				});
			}).catch((error) => {
				console.log(TAG, 'Token signing error.', error);
				response.sendStatus(500);
			});
		}

		if (request.body.grant_type === 'password') {
			// Authenticate user credentials.
			passport.authenticate('local', (error, account) => {
				if (error) {
					return next(error);
				}

				if (!account) {
					return response.sendStatus(401);
				}

				// Login successful.
				request.logIn(account, (error) => {
					if (error) {
						return next(error);
					}

					respondWithAccessToken(account);
				});
			})(request, response, next);
		} else if (request.body.grant_type === 'refresh') {
			const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {};

			verifyAccessToken(cookies.access_token, request.headers['x-xsrf-token']).then(({account, refresh_token}) => {
				account.verifyRefreshToken(refresh_token).then((is_refresh_token_valid) => {
					if (is_refresh_token_valid) {
						respondWithAccessToken(account);
					} else {
						response.sendStatus(401);
					}
				}).catch(() => {
					response.sendStatus(500);
				});
			}).catch((error) => {
				console.log(TAG, 'Error validating access token (' + error + ').');
				response.sendStatus(401);
			});
		} else {
			response.sendStatus(400);
		}
	});

	app.post('/api/logout', (request, response) => {
		// Delete the token cookies from client.
		response.setHeader('Set-Cookie', 'access_token=null; path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT;');
		response.sendStatus(200);
	});

	app.post('/api/account', (request, response) => {
		const username = request.body.username,
			password = request.body.password;

		AccountsManager.createAccount({username, password}).then((account) => {
			const account_client_serialized = account.clientSerialize();

			console.log(TAG, 'Created account.', account_client_serialized);

			response.status(201).json({account: account_client_serialized});
		}).catch((error) => {
			if (error === 'username') {
				response.sendStatus(409);
				return;
			}

			if(error === 'password') {
				response.sendStatus(422);
				return;
			}

			console.error('Tried to create an account, but there was an error.', error);
			response.sendStatus(500);
		});
	});

	app.get('/service-content/camera-preview', (request, response) => {
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

			service.getPreviewImage().then((preview_image) => {
				if (!preview_image) {
					response.sendStatus(204);
					return;
				}

				response.type('jpeg').end(Buffer.from(preview_image, 'base64'));
			}).catch((error) => response.sendStatus(500));
		}).catch((error) => {
			console.log(TAG, 'Error validating access token (' + error + ').');
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
			}).catch((error) => response.sendStatus(500));
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

	function getClipLength(cameraRecordingDir, playlistFiles) {
		let promises = [];
		for (let i=0; i < playlistFiles.length; i++) {
			let clipDir = cameraRecordingDir,
				clip = 'playlist' + playlistFiles[i] + '.ts',
				// lengthCmd = 'mediainfo --Inform="Video;%Duration%" ' + clipPath;
				lengthCmd = 'cd ' + clipDir + ' && mediainfo --Inform="Video;%Duration%" ' + clip;

			promises.push(
				new Promise((resolve, reject) => {
					Exec(lengthCmd, (error, stdout, stderr) => {
						let clipLength = parseInt(stdout.replace("\n","")) / 1000;
						// console.log(TAG, lengthCmd, stdout, clipLength)
						resolve(clipLength);
					})
				})
			);
		}
		return Promise.all(promises);
	}


	function recordMotion (info) {
		let METHOD_TAG = TAG + "[recordMotion]";

		if (info.filename.indexOf('playlist.m3u8') > -1) return;

		if (info.motionTime.start > 0) {
			const
				timeStamp = new Date(info.motionTime.start),
				fileDir = timeStamp.toISOString().split('.')[0].replace('T','_'),
				cameraRecordingDir = recordingsDir
					+ info.cameraId + '/'
					+ timeStamp.getFullYear() + '/'
					+ timeStamp.getMonth() + '/'
					+ timeStamp.getDate() + '/'
					+ fileDir + '/',
				filePath = cameraRecordingDir + '/' + info.filename,
				playlistPath = cameraRecordingDir + 'playlist.m3u8';

			try {
					fs.mkdir(cameraRecordingDir,  { recursive: true }, (err)=>{
						if (err) console.log(METHOD_TAG, 'mkdir', cameraRecordingDir, err);
						fs.copyFile(info.path, filePath, (err)=>{
							if (err) console.log(METHOD_TAG, 'copyFile', info.path, filePath, err);

								if (info.motionTime.stop > 0) {
									let findCmd = 'find ' + cameraRecordingDir + ' -name \"*.ts\" -exec basename {} \\;';

									Exec(findCmd, (error, stdout, stderr) => {
										let
											playlistFiles = stdout.toString().split('\n');

										for (let i=0; i < playlistFiles.length; i++) {
											playlistFiles[i] = playlistFiles[i].replace('playlist', '').replace('.ts','')
											playlistFiles[i] = parseInt(playlistFiles[i])
										}

										playlistFiles.sort((a,b) => a-b);
										playlistFiles.pop();

										file = ""
											+ "#EXTM3U\n"
											+ "#EXT-X-VERSION:3\n"
											+ "#EXT-X-TARGETDURATION:" + String(HLS_TIME) + "\n"
											+ "#EXT-X-MEDIA-SEQUENCE:" + playlistFiles[0] + "\n";

										getClipLength(cameraRecordingDir, playlistFiles).then(results => {
											for (let i=0; i < results.length; i++) {
												file += "#EXTINF:" + results[i] + ",\n";
												file += "playlist" + playlistFiles[i] + ".ts\n";
											}

											fs.writeFileSync(playlistPath, file, function(err) {
												if(err) return console.error(TAG, err);
											});

									  }).catch(err => {
									      console.log(METHOD_TAG, err);
									  });

										let recordingInfo = {
											id: uuid(),
											camera_id: info.cameraId,
											file: playlistPath,
											date: timeStamp.toISOString(),
											duration: Math.floor((info.motionTime.stop - info.motionTime.start) / 1000)
										}

										database.set_camera_recording(recordingInfo).then((record) => {
											// console.log(METHOD_TAG, "!! set_camera_recording !!",recordingInfo);
										});
									});
								}

						});
					});
			} catch (e) {
					console.log(METHOD_TAG, 'ERROR: ', e);
			}
		}
	}


	app.post('/stream/upload', (req, res) => {
		const
			METHOD_TAG = TAG + '[/stream/upload]',
			form = formidable({ uploadDir: tmpDir });

		let info = {};

		form
      .on('field', (fieldName, data) => {
				info = JSON.parse(data);
				info.cameraStreamDir = streamDir + info.cameraId + '/';
      })
      .on('file', (fieldName, file) => {
				info.filename = file.originalFilename;
				info.tmp = file.filepath
				// res.redirect('back');
				res.send({
					'received': file.originalFilename
				});
      })
      .on('end', () => {
				if (typeof(info.tmp) != 'string') return;
				info.path = info.cameraStreamDir + info.filename;

				fs.mkdir(info.cameraStreamDir, { recursive: true }, (err)=>{
					if (err) console.log(TAG, 'mkdir', info.cameraStreamDir, err);
					fs.exists(info.tmp, (exists) => {
						if (err) console.log(TAG, 'exists', info.tmp, exists);
						fs.copyFile(info.tmp, info.path, (err)=>{
								if (err) console.log(TAG, 'copy', info.tmp, err);
								fs.rm(info.tmp, { force: true, recusive: true }, (err)=>{
									if (err) console.log(TAG, 'rm', info.tmp, err);
									recordMotion(info);
								});
						});
					})
				});

				Exec('cat ' + info.cameraStreamDir + 'playlist.m3u8 | grep .ts', (error, stdout, stderr) => {
					let playlistFiles = stdout.toString().split('\n');
					playlistFiles.push('playlist.m3u8');
					playlistFiles.push(info.filename);
					Exec('ls ' + info.cameraStreamDir, (error, stdout, stderr) => {
						dirFiles = stdout.toString().split('\n');
						dirFiles.forEach((item) => {
							if (playlistFiles.indexOf(item) > -1) return;
							let cmd = 'rm ' + info.cameraStreamDir + item;
							Exec(cmd);
						});
					});
				});
      });

    form.parse(req);

	});

	app.get('/js/config.js', (request, response) => {
		response.type('.js').send('window.OpenAutomation = {config: ' + JSON.stringify({
			app_name: process.env.OA_APP_NAME || 'Open Automation',
			logo_path: logo_file_path
		}) + '};');
	});

	app.get('/hls/video', function(req, res) {
			const
				stream_id = req.query.stream_id,
				cameraStreamDir = streamDir + stream_id + '/',
				playlistPath = cameraStreamDir + 'playlist.m3u8',
				playlistUrl = '/stream/' + stream_id + '/' + 'playlist.m3u8',
				makeCameraStreamDir = "mkdir -p " + cameraStreamDir;

			let
				stats = null;

			try {
					fs.mkdirSync(cameraStreamDir, { recursive: true });
	    } catch (e) {
					// console.log(TAG, 'ERROR: ', e);
	    }

	    try {
	        stats = fs.statSync(playlistPath);
	    } catch (e) {
					// console.log('/hls/video', e);
	    }
	    if (stats) {
					// console.log(TAG, '/hls/video file exists, redirecting', playlistUrl);
	        return res.redirect(playlistUrl);
	    }

	    var redirected = false;
	    let watcher = fs.watch(cameraStreamDir, (e, f) => {
	        if (e === "change" && f === "playlist.m3u8") {
	            if (!res.writableEnded) {
									// console.log(TAG, 'returning ', playlistUrl, req.query.stream_id, e, f);
	                res.redirect(playlistUrl);
	                redirected = true;
									console.log(TAG, 'redirected to', playlistUrl);
	            }
							watcher.close();
	        }
	    });
	});

	app.get('/hls/video_recording', function(req, res) {
			console.log(TAG, "!! /hls/video_recording !!", req.query);

			const
				cameraId = req.query.camera_id,
				recordingId = req.query.recording_id;

			let
				stats = null;

			database.get_camera_recording(recordingId).then((record) => {
				let playlistPath = record.file,
					playlistUrl = playlistPath.replace('/usr/local/lib/open-automation', '');

				try {
					stats = fs.statSync(playlistPath);
				} catch (e) {
					// console.error(TAG, '/hls/video_recording playlist file does not exist.', playlistUrl);
				}

				if (stats) {
						console.log(TAG, '/hls/video_recording file exists, redirecting', playlistUrl);
						return res.redirect(playlistUrl);
				}
			});
	});

	app.get('*', (request, response) => {
		// console.log(TAG, "Sending index.html");
		if (do_hot_module_replacement) {
			webpack_compiler.outputFileSystem.readFile(path.join(webpack_compiler.outputPath, 'index.html'), (error, result) => {
				if (error) {
					return next(error);
				}

				response.set('content-type', 'text/html');
				response.send(result);
				response.end();
			});
		} else {
			response.sendFile('/index.html', {root: __dirname + '/../public'});
		}
	});

	return app;
};
