import React from 'react';
import PropTypes from 'prop-types';
import VideoPlayer from './VideoPlayer.js';

export class CameraCard extends React.Component {
	render () {
		return <VideoPlayer camera={this.props.camera} />;
	}
}

CameraCard.propTypes = {
	camera: PropTypes.object
};

export default CameraCard;
