import React from 'react';
import PropTypes from 'prop-types';
import VideoPlayer from './VideoPlayer.js';

export class CameraCard extends React.Component {
	render () {
		return (
			<VideoPlayer
				cameraServiceId={this.props.camera.id}
				streamingToken={this.props.camera.streaming_token}
				width={this.props.camera.settings.resolution_w}
				height={this.props.camera.settings.resolution_h} />
		);
	}
}

CameraCard.propTypes = {
	camera: PropTypes.object
};

export default CameraCard;
