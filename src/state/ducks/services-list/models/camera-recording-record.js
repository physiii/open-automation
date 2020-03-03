import Immutable from 'immutable';

const CameraRecordingRecord = Immutable.Record({
	id: null,
	camera_id: null,
	date: null,
	duration: 0,
	width: 640,
	height: 480,
	streaming_token: null
});

export default CameraRecordingRecord;
