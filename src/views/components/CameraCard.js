import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import CameraIcon from '../icons/CameraIcon.js';
import Button from './Button.js';
import VideoPlayer from './VideoPlayer.js';

export class CameraCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			isStreaming: false
		};

		this.onStreamStart = this.onStreamStart.bind(this);
		this.onStreamStop = this.onStreamStop.bind(this);
	}

	onStreamStart () {
		this.setState({isStreaming: true});
	}

	onStreamStop () {
		this.setState({isStreaming: false});
	}

	render () {
		let status = 'No movement recorded';

		return (
			<ServiceCardBase
				name={this.props.camera.settings.name || 'Camera'}
				status={status}
				icon={<CameraIcon />}
				content={<VideoPlayer
					cameraServiceId={this.props.camera.id}
					streamingToken={this.props.camera.streaming_token}
					width={this.props.camera.settings.resolution_w}
					height={this.props.camera.settings.resolution_h}
					onPlay={this.onStreamStart}
					onStop={this.onStreamStop} />}
				toolbarsOverlayContent={true}
				secondaryAction={<Button to={`${this.props.parentPath}/recordings/${this.props.camera.id}`}>View Recordings</Button>}
				hideToolbars={this.state.isStreaming} />
		);
	}
}

CameraCard.propTypes = {
	camera: PropTypes.object,
	parentPath: PropTypes.string
};

export default CameraCard;
