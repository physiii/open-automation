import Immutable from 'immutable';
import moment from 'moment';

class CameraRecordingRecord extends Immutable.Record({
	id: null,
	camera_id: null,
	date: null,
	duration: 0,
	width: 640,
	height: 480
}) {
	constructor (values) {
		super({
			...values,
			date: moment(values.date)
		});
	}

	set (key, value) {
		if (key === 'date') {
			return super.set(key, moment(value));
		}

		return super.set(key, value);
	}
}

export default CameraRecordingRecord;
