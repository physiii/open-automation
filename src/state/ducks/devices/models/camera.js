import Immutable from 'immutable';
import DeviceRecord from './device-record.js';

class Camera extends DeviceRecord({
	camera_number: null,
	recordings: Immutable.List([]),
	resolution: Immutable.Record({
		width: 600,
		height: 480
	})
}) {}

export default Camera;
