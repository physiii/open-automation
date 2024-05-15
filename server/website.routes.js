// website.routes.js
const DevicesManager = require('./devices/devices-manager.js');
const database = require('./database.js');
const uuid = require('uuid').v4;
const path = require('path');
const fs = require('fs').promises;
const util = require('node:util');
const exec = util.promisify(require('child_process').exec);
const tmpDir = '/tmp/open-automation';
const streamDir = tmpDir + '/stream/';
const recordingsDir = '/usr/local/lib/open-automation/recording/';
const multer = require('multer');
const MILLISECONDS_PER_SECOND = 1000;
const TAG = '[website.routes.js]';
const multerUpload = multer({ dest: tmpDir });
const serviceContentRoutes = require('./service.routes.js');

async function getClipLength(cameraRecordingDir, playlistFiles) {
    try {
        const clipLengths = await Promise.all(playlistFiles.map(async playlistFile => {
            const lengthCmd = `cd ${cameraRecordingDir} && mediainfo --Inform="Video;%Duration%" playlist${playlistFile}.ts`;
            const { stdout } = await exec(lengthCmd);
            return parseInt(stdout.replace("\n", ""), 10) / 1000;
        }));

        return clipLengths;
    } catch (err) {
        throw err;
    }
}

function formatTimestampForFilename(date) {
    return date.toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
}

async function combineHLSChunks(cameraRecordingDir, timeStamp) {
    const METHOD_TAG = `${TAG}[combineHLSChunks]`;
    const formattedTimeStamp = formatTimestampForFilename(timeStamp);

    // Temporary directory for processing .ts files
    const tempProcessingDir = path.join(tmpDir, `processing_${formattedTimeStamp}`);
    await fs.mkdir(tempProcessingDir, { recursive: true });

    // Moving .ts files to temporary directory
    const moveCmd = `mv ${cameraRecordingDir}/*.ts ${tempProcessingDir}/`;
    await exec(moveCmd);

    // Generating a sorted list of .ts files in temporary directory
    const { stdout } = await exec(`ls ${tempProcessingDir}/*.ts | sort -V`);
    const tsFiles = stdout.split('\n').filter(file => file.endsWith('.ts'));

    if (tsFiles.length === 0) {
        console.error(METHOD_TAG, 'No .ts files found in temporary directory');
        return;
    }

    // Use absolute paths for the file list
    const fileListContent = tsFiles.map(file => `file '${file}'`).join('\n');
    const tempFileList = path.join(tempProcessingDir, 'filelist.txt');
    await fs.writeFile(tempFileList, fileListContent);

    const combinedFileName = `${formattedTimeStamp}.mp4`;
    const combinedFilePath = path.join(cameraRecordingDir, combinedFileName);
    const ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i ${tempFileList} -c copy ${combinedFilePath}`;

    try {
        await exec(ffmpegCmd);
    } catch (err) {
        console.error(METHOD_TAG, 'Error executing FFmpeg:', err);
        return;
    }

    // Cleaning up: Delete temporary files and directory
    await fs.unlink(tempFileList);
    await fs.rmdir(tempProcessingDir, { recursive: true });

    return combinedFilePath;
}

async function transcribeFile(combinedFilePath) {
    const METHOD_TAG = `${TAG}[transcribeFile]`;
    console.log(METHOD_TAG, 'Transcribing file:', combinedFilePath);

    const transcribeScriptPath = '/home/andy/scripts/transcribe.py';
    const transcribeCmd = `/usr/bin/python ${transcribeScriptPath} ${combinedFilePath}`;
    
    try {
        // Include /home/andy/.local/bin in the PATH environment variable
        const { stdout, stderr } = await exec(transcribeCmd, {
            env: {
                ...process.env,
                PATH: `${process.env.PATH}:/home/andy/.local/bin`
            }
        });
        console.log(METHOD_TAG, 'Transcription completed:', stdout, stderr);
    } catch (err) {
        console.error(METHOD_TAG, 'Error executing transcription script:', err);
    }
}

async function recordMotion(info) {
    const METHOD_TAG = `${TAG}[recordMotion]`;
    const timeStamp = new Date(info.motionTime.start);
    const formattedTimeStamp = formatTimestampForFilename(timeStamp);

    // Modify the cameraRecordingDir to exclude the timestamp folder
    const cameraRecordingDir = path.join(recordingsDir, info.cameraId, timeStamp.getFullYear().toString(),
        (timeStamp.getMonth() + 1).toString().padStart(2, '0'), timeStamp.getDate().toString().padStart(2, '0'));

	if (info.motionTime.start <= 0) return;

    await fs.mkdir(cameraRecordingDir, { recursive: true });
    await fs.copyFile(info.path, path.join(cameraRecordingDir, info.filename));

    if (info.motionTime.stop <= 0) return;
	
	const combinedFilePath = await combineHLSChunks(cameraRecordingDir, timeStamp);
	if (!combinedFilePath) return;
	console.log(METHOD_TAG, 'combinedFilePath:', combinedFilePath);
	transcribeFile(combinedFilePath);

	const recordingInfo = {
		id: uuid(),
		camera_id: info.cameraId,
		file: combinedFilePath,
		date: timeStamp.toISOString(),
		duration: Math.floor((info.motionTime.stop - info.motionTime.start) / MILLISECONDS_PER_SECOND)
	};

	try {
		await database.set_camera_recording(recordingInfo);
	} catch (err) {
		console.error(METHOD_TAG, '[ERROR]', '[database.set_camera_recording]', recordingInfo, err);
	}
}

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
		const { stdout: playlistStdout } = await exec(playlistCmd);
		const playlistFiles = playlistStdout.split('\n');
		playlistFiles.push('playlist.m3u8');
		playlistFiles.push(info.filename);

		// Fetch all files in the directory
		const dirFilesCmd = `ls ${cameraStreamDir}`;
		const { stdout: dirStdout } = await exec(dirFilesCmd);
		const dirFiles = dirStdout.split('\n');

		// Remove files that are not in the playlist
		for (const item of dirFiles) {
			if (playlistFiles.includes(item)) continue;
			const rmCmd = `rm ${cameraStreamDir}${item}`;
			await exec(rmCmd);
		}
	} catch (err) {
		console.error('[cleanUpCameraStreamDir] Error:', err);
	}
}

module.exports = function (app) {
	serviceContentRoutes(app);
	
	app.post('/stream/upload', multerUpload.single('file'), async (req, res) => {
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
		await cleanUpCameraStreamDir(info, exec);
		res.send({ received: file.originalname, info });
	});

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
