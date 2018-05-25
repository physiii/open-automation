import React from 'react';
import PropTypes from 'prop-types';
import JSMpeg from '../../lib/tokenJsmpeg.js';
import {connect} from 'react-redux';
import {startCameraStream, stopCameraStream, startCameraRecordingStream, stopCameraRecordingStream} from '../../state/ducks/services-list/operations.js';
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

		// Only re-render if the camera or recording changes. This prevents unnecessary
		// re-bootstrapping of JSMpeg.
		if (nextProps.recording.id !== this.props.recording.id || nextProps.cameraServiceId !== this.props.cameraServiceId || nextProps.streamingToken !== this.props.streamingToken) {
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
			oa_stream_id: this.props.recording ? this.props.recording.id : this.props.cameraServiceId,
			oa_stream_token: this.props.streamingToken
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
	cameraServiceId: PropTypes.string.isRequired,
	recording: PropTypes.object, // TODO: Shape of recording object
	streamingToken: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	shouldStream: PropTypes.bool,
	className: PropTypes.string,
	startStreaming: PropTypes.func.isRequired,
	stopStreaming: PropTypes.func.isRequired
};

export const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		startStreaming: () => {
			console.log('Start streaming', ownProps.recording);
			if (ownProps.recording) {
				dispatch(startCameraRecordingStream(ownProps.recording));
			} else {
				dispatch(startCameraStream(ownProps.cameraServiceId));
			}
		},
		stopStreaming: () => {
			if (ownProps.recording) {
				dispatch(stopCameraRecordingStream(ownProps.recording));
			} else {
				dispatch(stopCameraStream(ownProps.cameraServiceId));
			}
		}
	};
};

export default connect(null, mapDispatchToProps)(VideoStream);
