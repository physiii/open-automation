import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import ServiceCardBase from './ServiceCardBase.js';

export const ServiceCard = (props) => {
	switch (props.service.type) {
		case 'camera':
			return <CameraCard camera={props.service} parentPath={props.parentPath} />;
		default:
			return <ServiceCardBase name={props.service.settings.name} parentPath={props.parentPath} />;
	}
};

ServiceCard.propTypes = {
	service: PropTypes.object,
	parentPath: PropTypes.string
};

export default ServiceCard;
