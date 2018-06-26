import ServiceRecord from './service-record.js';

// The Camera model defines the fields specific to a camera service and their defualt values.
class Camera extends ServiceRecord({
	recordingsList: null,
	streaming_token: null,
	settings: {
		resolution_w: 640,
		resolution_h: 480,
		rotation: 0
	},
	state: {
		preview_image: null,
		last_recording_date: null
	}
}) {}

export default Camera;
