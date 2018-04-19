import React from 'react';
import PropTypes from 'prop-types';
import VideoStream from './VideoStream.js';

export const CameraCard = (props) => {
	return <VideoStream camera={props.camera} />;
};

CameraCard.propTypes = {
	camera: PropTypes.object
};

export default CameraCard;
