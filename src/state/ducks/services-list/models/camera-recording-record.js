import Immutable from 'immutable';

class CameraRecordingRecord extends Immutable.Record({
	id: null,
	camera_id: null,
	date: null,
	duration: 0,
	width: 640,
	height: 480,
	streaming_token: null
}) {
	constructor (values) {
		super({
			...values
		});
	}

	set (key, value) { // TODO: Pointless
		return super.set(key, value);
	}
}

export default CameraRecordingRecord;
