import React from 'react';
import PropTypes from 'prop-types';
import JSMpeg from '../../lib/jsmpeg/jsmpeg.min.js';
import {connect} from 'react-redux';
import {startCameraStream, stopCameraStream} from '../../state/ducks/devices/operations.js';

export class VideoStream extends React.Component {
	constructor (props) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount () {
		this.bootstrapPlayer();
		this.props.startStreaming(this.props.camera);
	}

	componentDidUpdate () {
		this.bootstrapPlayer();
	}

	componentWillUnmount () {
		this.props.stopStreaming(this.props.camera);
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
		return <canvas ref={this.canvas} />;
	}
}

VideoStream.propTypes = {
	camera: PropTypes.object.isRequired,
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
