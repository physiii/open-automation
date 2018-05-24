import React from 'react';
import PropTypes from 'prop-types';
import JSMpeg from '../../lib/tokenJsmpeg.js';
import {connect} from 'react-redux';
import {playCameraRecording, startCameraStream, stopCameraStream} from '../../state/ducks/devices-list/operations.js';
import {deviceById} from '../../state/ducks/devices-list/selectors.js';
import '../styles/modules/_VideoStream.scss';

export class VideoStream extends React.Component {
	constructor (props) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount () {
		this.bootstrapPlayer();
	}

	shouldComponentUpdate (nextProps) {
		// Check to see if shouldStream changed, and if so, start or stop the stream.
		if (!this.props.shouldStream && nextProps.shouldStream) {
			this.start();
		} else if (this.props.shouldStream && !nextProps.shouldStream) {
			this.stop();
		}

		// Only re-render if the camera or file changes. This prevents unnecessary
		// re-bootstrapping of JSMpeg.
		if (nextProps.file !== this.props.file || nextProps.cameraId !== this.props.cameraId) {
			return true;
		}

		return false;
	}

	componentDidUpdate () {
		this.bootstrapPlayer();
	}

	componentWillUnmount () {
		this.stop();
		this.player.destroy();
	}

	start () {
		this.props.startStreaming();

		// Need to match exactly false because of JSMpeg quirks.
		if (this.player.isPlaying === false) {
			this.player.play();
		}
		console.log('framerate', this.player.video.frameRate);
	}

	stop () {
		this.props.stopStreaming();

		if (this.player.isPlaying) {
			this.player.pause();
		}
	}

	bootstrapPlayer () {
		// TODO: Use actual host and streaming port. Add secure socket support (wss://).
		this.player = new JSMpeg.Player('ws://localhost:8085', {
			canvas: this.canvas.current,
			token: this.props.jsmpegToken,
			camera: this.props.jsmpegCamera
		});

		if (this.props.shouldStream) {
			this.start();
		} else {
			this.stop();
		}
	}

	render () {
		return (
			<canvas
				className={this.props.className || 'oa-VideoStream'}
				width={this.props.width}
				height={this.props.height}
				ref={this.canvas} />
		);
	}
}

VideoStream.propTypes = {
	cameraId: PropTypes.string.isRequired,
	jsmpegCamera: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]).isRequired,
	jsmpegToken: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	file: PropTypes.string,
	shouldStream: PropTypes.bool,
	className: PropTypes.string,
	startStreaming: PropTypes.func.isRequired,
	stopStreaming: PropTypes.func.isRequired
};

export const mapStateToProps = (state, ownProps) => {
		const camera = ownProps.camera || deviceById(ownProps.cameraId, state.devicesList.devices);

		return {
			camera,
			cameraId: camera.id,
			jsmpegCamera: camera.id,
			jsmpegToken: null, // TODO
			width: camera.settings.resolution_w || 640,
			height: camera.settings.resolution_h || 480
		};
	},
	mapDispatchToProps = (dispatch) => ({dispatch}),
	mergeProps = (stateProps, dispatchProps, ownProps) => {
		const {dispatch} = dispatchProps,
			{camera, ...restOfStateProps} = stateProps;

		return {
			...ownProps,
			...restOfStateProps,
			// Enable overriding width and height.
			width: ownProps.width || restOfStateProps.width,
			height: ownProps.height || restOfStateProps.height,
			startStreaming: () => {
				if (ownProps.file) {
					dispatch(playCameraRecording(camera, ownProps.file));
				} else {
					dispatch(startCameraStream(camera));
				}
			},
			stopStreaming: () => {
				dispatch(stopCameraStream(camera));
			}
		};
	};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(VideoStream);
