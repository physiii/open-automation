const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = require('./website.setup');
const AccountsManager = require('./accounts/accounts-manager.js');
const setupRoutes = require('./website.routes');

const TAG = '[website.js]';
const tmpDir = '/tmp/open-automation';
const streamDir = path.join(tmpDir, '/stream/');
const MILLISECONDS_PER_SECOND = 1000;

module.exports = function (jwt_secret) {
    console.log(TAG, 'Starting website...', process.env);

	let logo_file_path = process.env.OA_LOGO_PATH || 'logo.png';

	try {
		fs.accessSync(__dirname + '/../public/' + logo_file_path);
	} catch (error) {
		logo_file_path = false;
	}

    // Remove existing temporary directory and create stream directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(streamDir, { recursive: true });

    // Setup options for helmet middleware
    const helmetOptions = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                scriptSrc: ['\'self\''],
                styleSrc: ['\'self\''],
                connectSrc: [
                    '\'self\'',
                    `${process.env.OA_SSL ? 'wss' : 'ws'}://${process.env.OA_DOMAIN_NAME}`
                ]
            }
        },
        crossdomain: { permittedPolicies: 'none' },
        frameguard: { action: 'deny' }
    };

    // Loosen security policies in development mode
    if (process.env.NODE_ENV === 'development') {
        helmetOptions.contentSecurityPolicy.directives.scriptSrc.push('\'unsafe-eval\'', '\'unsafe-inline\'');
        helmetOptions.contentSecurityPolicy.directives.styleSrc.push('\'unsafe-inline\'', 'blob:');
        helmetOptions.hsts = false;
    }

    // Verify Access Token
    const verifyAccessToken = (access_token, xsrf_token, skip_xsrf) => {
        return new Promise((resolve, reject) => {
            if (!access_token) {
                return reject('No access token');
            }

            jwt.verify(access_token, jwt_secret, { issuer: process.env.OA_API_TOKEN_ISSUER }, (error, claims) => {
                if (error) {
                    return reject(`Invalid access token ${error.name}`);
                }

                if (!skip_xsrf && xsrf_token !== claims.xsrf_token) {
                    return reject('Invalid XSRF token');
                }

                const account = AccountsManager.getAccountById(claims.sub);

                if (!account) {
                    return reject('Account not found');
                }

                resolve({
                    account,
                    refresh_token: claims.refresh_token
                });
            });
        });
    };

    // Routes
    setupRoutes(app);

    app.get('/js/config.js', (req, res) => {
        const config = {
            app_name: process.env.OA_APP_NAME || 'Open Automation',
            logo_path: logo_file_path
        };
        res.type('.js').send(`window.OpenAutomation = {config: ${JSON.stringify(config)}};`);
    });

    app.get('/get_ip', (req, res) => {
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
        res.send(ip);
    });

    app.post('/api/token', (req, res, next) => {
        const respondWithAccessToken = (account) => {
            account.generateAccessToken(process.env.OA_API_TOKEN_ISSUER, jwt_secret).then((tokens) => {
                const cookieOptions = `access_token=${tokens.access_token}; path=/; HttpOnly;${process.env.OA_SSL ? ' Secure;' : ''}`;
                res.setHeader('Set-Cookie', cookieOptions);
                res.json({
                    account: account.clientSerialize(),
                    xsrf_token: tokens.xsrf_token,
                    access_token_expires: jwt.decode(tokens.access_token).exp * MILLISECONDS_PER_SECOND
                });
            }).catch((error) => {
                console.log(TAG, 'Token signing error.', error);
                res.sendStatus(500);
            });
        };

        // Authenticate user credentials
        if (req.body.grant_type === 'password') {
            passport.authenticate('local', (error, account) => {
                if (error) return next(error);
                if (!account) return res.sendStatus(401);

                req.logIn(account, (error) => {
                    if (error) return next(error);
                    respondWithAccessToken(account);
                });
            })(req, res, next);
        } else if (req.body.grant_type === 'refresh') {
            const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

            verifyAccessToken(cookies.access_token, req.headers['x-xsrf-token']).then(({ account, refresh_token }) => {
                account.verifyRefreshToken(refresh_token).then((is_refresh_token_valid) => {
                    if (is_refresh_token_valid) {
                        respondWithAccessToken(account);
                    } else {
                        res.sendStatus(401);
                    }
                }).catch(() => {
                    res.sendStatus(500);
                });
            }).catch((error) => {
                console.log(TAG, `Error validating access token (${error}).`);
                res.sendStatus(401);
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.post('/api/logout', (req, res) => {
        res.setHeader('Set-Cookie', 'access_token=null; path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT;');
        res.sendStatus(200);
    });

    app.post('/api/account', (req, res) => {
        const { username, password } = req.body;

        AccountsManager.createAccount({ username, password }).then((account) => {
            console.log(TAG, 'Created account.', account.clientSerialize());
            res.status(201).json({ account: account.clientSerialize() });
        }).catch((error) => {
            const status = error === 'username' ? 409 : error === 'password' ? 422 : 500;
            res.sendStatus(status);
        });
    });

    app.get('*', (req, res) => {
        console.log(TAG, 'Sending index.html');
        res.sendFile('index.html', { root: path.resolve(__dirname, '../public') });
    });

<<<<<<< HEAD
    return app;
=======
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
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
};
