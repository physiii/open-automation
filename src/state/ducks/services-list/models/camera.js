import Immutable from 'immutable';
import DeviceRecord from './device-record.js';

const resolution = Immutable.Record({
	width: 640,
	height: 480
});

class Camera extends DeviceRecord({
	camera_number: null,
	recordingsList: null,
	resolution: new resolution()
}) {}

export default Camera;
