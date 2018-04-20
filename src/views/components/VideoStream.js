import React from 'react';
import PropTypes from 'prop-types';
import JSMpeg from '../../lib/jsmpeg/jsmpeg.min.js';
import {connect} from 'react-redux';
import {startCameraStream, stopCameraStream} from '../../state/ducks/devices/operations.js';
import '../styles/modules/_VideoStream.scss';

export class VideoStream extends React.Component {
	constructor (props) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount () {
		this.bootstrapPlayer();

		if (this.props.shouldPlay) {
			this.play();
		} else {
			this.pause();
		}
	}

	shouldComponentUpdate (nextProps) {
		// Check to see if shouldPlay changed, and if so, play or pause the stream.
		if (!this.props.shouldPlay && nextProps.shouldPlay) {
			this.play();
		} else if (this.props.shouldPlay && !nextProps.shouldPlay) {
			this.pause();
		}

		// Never re-render after first render. This prevents unnecessary
		// re-bootstrapping of JSMpeg.
		return false;
	}

	componentDidUpdate () {
		this.bootstrapPlayer();
	}

	componentWillUnmount () {
		this.pause();
		// this.player.destroy(); // TODO: This doesn't work. Need to update JSMpeg?
	}

	play () {
		this.props.startStreaming(this.props.camera);

		// Need to match exactly false because of JSMpeg quirks.
		if (this.player.isPlaying === false) {
			this.player.play();
		}
	}

	pause () {
		this.props.stopStreaming(this.props.camera);

		if (this.player.isPlaying) {
			this.player.pause();
		}
	}

	bootstrapPlayer () {
		// TODO: Use actual host and streaming port. Add secure socket support (wss://).
		this.player = new JSMpeg.Player('ws://localhost:8085', {
			canvas: this.canvas.current,
			token: this.props.camera.token,
			camera: this.props.camera.camera_number
		});
	}

	render () {
		return (
			<canvas
				className={this.props.className || 'oa-VideoStream'}
				style={{
					width: this.props.camera.resolution.width,
					height: this.props.camera.resolution.height
				}}
				ref={this.canvas} />
		);
	}
}

VideoStream.propTypes = {
	camera: PropTypes.object.isRequired,
	shouldPlay: PropTypes.bool,
	className: PropTypes.string,
	startStreaming: PropTypes.func.isRequired,
	stopStreaming: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch) => ({
	startStreaming: (camera) => {
		dispatch(startCameraStream(camera));
	},
	stopStreaming: (camera) => {
		dispatch(stopCameraStream(camera));
	}
});

export default connect(null, mapDispatchToProps)(VideoStream);
