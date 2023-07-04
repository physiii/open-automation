const DevicesManager = require('./devices/devices-manager.js');
const database = require('./database.js');
const uuid = require('uuid').v4;
const cookie = require('cookie');
const path = require('path');
const fs = require('fs').promises;
const util = require('node:util');
const Exec = util.promisify(require('child_process').exec);
const tmpDir = '/tmp/open-automation';
const streamDir = tmpDir + '/stream/';
const recordingsDir = '/usr/local/lib/open-automation/recording/';
const multer = require('multer');
const MILLISECONDS_PER_SECOND = 1000;
const HLS_TIME = 10;
const TAG = '[website.routes.js]';
const url = require('url');

function verifyHostname(referrer) {
    return referrer && url.parse(referrer).hostname !== process.env.OA_DOMAIN_NAME;
}

function handleError(res, error, message) {
    console.log(TAG, message, error);
    res.sendStatus(500);
}

async function mkdirRecursive(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
        console.error(TAG, '[mkdir]', dirPath, err);
    }
}

async function copyFile(src, dest) {
    try {
        await fs.copyFile(src, dest);
    } catch (err) {
        console.error(TAG, '[copyFile]', src, dest, err);
    }
}

async function execCommand(command) {
    try {
        const { stdout } = await Exec(command);
        return stdout;
    } catch (err) {
        console.error(TAG, '[execCommand] Error executing command:', command, err);
        throw err;
    }
}

async function getClipLength(cameraRecordingDir, playlistFiles) {
    try {
        const clipLengths = await Promise.all(playlistFiles.map(async playlistFile => {
            const lengthCmd = `cd ${cameraRecordingDir} && mediainfo --Inform="Video;%Duration%" playlist${playlistFile}.ts`;
            const stdout = await execCommand(lengthCmd);
            return parseInt(stdout.replace("\n", ""), 10) / 1000;
        }));

        return clipLengths;
    } catch (err) {
        throw err;
    }
}

async function saveRecording(info, cameraRecordingDir, playlistPath, fileExists, timeStamp) {
    const METHOD_TAG = `${TAG}[saveRecording]`;
    
    const findCmd = `find ${cameraRecordingDir} -name "*.ts" -exec basename {} \\;`;
    const stdout = await execCommand(findCmd);
    let playlistFiles = stdout.split('\n');

    for (let i = 0; i < playlistFiles.length; i++) {
        playlistFiles[i] = parseInt(playlistFiles[i].replace('playlist', '').replace('.ts', ''));
    }
    
    playlistFiles.sort((a, b) => a - b);
    playlistFiles.pop();
    
    let file = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${HLS_TIME}\n#EXT-X-MEDIA-SEQUENCE:${playlistFiles[0]}\n`;
    const clipLengths = await getClipLength(cameraRecordingDir, playlistFiles);

    for (let i = 0; i < clipLengths.length; i++) {
        file += `#EXTINF:${clipLengths[i]},\n`;
        file += `playlist${playlistFiles[i]}.ts\n`;
    }

    try {
		await fs.writeFile(playlistPath, file);
    } catch (err) {
        console.error(METHOD_TAG, '[ERROR]', '[writeFile]', playlistPath, err);
    }
}

async function recordMotion(info) {
    const METHOD_TAG = `${TAG}[recordMotion]`;
	const timeStamp = new Date(info.motionTime.start);
	const fileDir = timeStamp.toISOString().split('.')[0].replace('T', '_');
	const cameraRecordingDir = path.join(recordingsDir, info.cameraId, timeStamp.getFullYear().toString(),
		timeStamp.getMonth().toString(), timeStamp.getDate().toString(), fileDir);
	const filePath = path.join(cameraRecordingDir, info.filename);
	const playlistPath = path.join(cameraRecordingDir, 'playlist.m3u8');

    if (info.motionTime.start > 0) {
        await mkdirRecursive(cameraRecordingDir);
        await copyFile(info.path, filePath);

        let fileExists = false;

        try {
            await fs.access(playlistPath);
            fileExists = true;
        } catch (error) {
            fileExists = false;
        }

		saveRecording(info, cameraRecordingDir, playlistPath, fileExists, timeStamp);
        
		if (info.motionTime.stop > 0) {
			const recordingInfo = {
				id: uuid(),
				camera_id: info.cameraId,
				file: playlistPath,
				date: timeStamp.toISOString(),
				duration: Math.floor((info.motionTime.stop - info.motionTime.start) / MILLISECONDS_PER_SECOND)
			};

			try {
				await database.set_camera_recording(recordingInfo);
			} catch (err) {
				console.error(METHOD_TAG, '[ERROR]', '[database.set_camera_recording]', recordingInfo, err);
			}
		}
    }
}

module.exports = function (app) {

    app.get('/service-content/camera-preview', (request, response) => {
        const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {};
        const referrer = request.get('Referrer');

        if (verifyHostname(referrer)) {
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
                    .catch(error => handleError(response, error, 'Error retrieving preview image.'));
            })
            .catch(error => handleError(response, error, 'Error validating access token.'));
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


	async function cleanUpCameraStreamDir(info) {
		try {
			const cameraStreamDir = info.cameraStreamDir;
			const playlistPath = cameraStreamDir + 'playlist.m3u8';
	
			// Check if playlist file exists before trying to access it
			try {
				await fs.access(playlistPath);
			} catch {
				return;
			}
	
			// Fetch .ts files from the playlist
			const playlistCmd = `cat ${playlistPath} | grep .ts`;
			const playlistStdout = await execCommand(playlistCmd);
			const playlistFiles = playlistStdout.split('\n');
			playlistFiles.push('playlist.m3u8');
			playlistFiles.push(info.filename);
	
			// Fetch all files in the directory
			const dirFilesCmd = `ls ${cameraStreamDir}`;
			const dirStdout = await execCommand(dirFilesCmd);
			const dirFiles = dirStdout.split('\n');
	
			// Remove files that are not in the playlist
			for (const item of dirFiles) {
				if (playlistFiles.indexOf(item) > -1) continue;
				if (playlistFiles.includes(item)) continue;
				const rmCmd = `rm ${cameraStreamDir}${item}`;
				await execCommand(rmCmd);
			}
		} catch (err) {
			console.error('[cleanUpCameraStreamDir] Error:', err);
		}
	}
		
	const multerUpload = multer({ dest: tmpDir }),
		uploadHandler = async (req, res) => {
			if (!req.file) {
				return res.status(400).send("No file was uploaded.");
			}
		
			const file = req.file;
			const info = JSON.parse(req.body.field);
			info.cameraStreamDir = `${streamDir}${info.cameraId}/`;
			info.filename = file.originalname;
			info.path = info.cameraStreamDir + info.filename;
		
			// if (file.mimetype && file.mimetype.startsWith('video/')) {
			// 	processFile(file, info.cameraStreamDir);
			// }
		
			try {
				await fs.mkdir(info.cameraStreamDir, { recursive: true });
				await fs.copyFile(file.path, `${info.cameraStreamDir}${info.filename}`);
				await fs.rm(file.path);
			} catch (err) {
				console.error('Error processing file:', err);
			}

			await recordMotion(info);
			await cleanUpCameraStreamDir(info, Exec);
			res.send({ received: file.originalname, info });
		};
	
	app.post('/stream/upload', multerUpload.single('file'), uploadHandler);

	app.get('/hls/video', async function(req, res) {
		const stream_id = req.query.stream_id;
		const cameraStreamDir = streamDir + stream_id + '/';
		const playlistPath = cameraStreamDir + 'playlist.m3u8';
		const playlistUrl = '/stream/' + stream_id + '/' + 'playlist.m3u8';
	
		try {
			await fs.mkdir(cameraStreamDir, { recursive: true });
		} catch (e) {
			console.log(TAG, 'ERROR: ', e);
		}
	
		try {
			const stats = await fs.stat(playlistPath);
			if (stats) {
				return res.redirect(playlistUrl);
			}
		} catch (e) {
			console.log('/hls/video', e);
		}
	
		let redirected = false;
		let watcher = fs.watch(cameraStreamDir, async (e, f) => {
			if (e === "change" && f === "playlist.m3u8") {
				if (!res.writableEnded) {
					res.redirect(playlistUrl);
					redirected = true;
					console.log(TAG, 'redirected to', playlistUrl);
				}
				watcher.close();
			}
		});
	});
	
	app.get('/hls/video_recording', async function(req, res) {
		console.log(TAG, "!! /hls/video_recording !!", req.query);
	
		const
			recordingId = req.query.recording_id;
	
		try {
			const record = await database.get_camera_recording(recordingId);
			const playlistPath = record.file;
			const playlistUrl = playlistPath.replace('/usr/local/lib/open-automation', '');
	
			try {
				await fs.stat(playlistPath); // Check if file exists
				console.log(TAG, '/hls/video_recording file exists, redirecting', playlistUrl);
				return res.redirect(playlistUrl);
			} catch (e) {
				console.error(TAG, '/hls/video_recording playlist file does not exist.', playlistUrl);
				return res.sendStatus(404); // Not Found
			}
		} catch (err) {
			console.error(TAG, '/hls/video_recording error getting camera recording from database.', err);
			return res.sendStatus(500); // Internal Server Error
		}
	});
};
