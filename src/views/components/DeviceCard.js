import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';

export const DeviceCard = (props) => {
	switch (props.device.type) {
		case 'camera':
			return <CameraCard camera={props.device} />;
		default:
			return null;
	}
};

DeviceCard.propTypes = {
	device: PropTypes.object
};

export default DeviceCard;
