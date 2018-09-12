import React from 'react';
import PropTypes from 'prop-types';
import CameraIcon from '../icons/CameraIcon.js';

export const ServiceIcon = (props) => {
	const Icon = ServiceIcon.iconComponents[props.service.type];

	return Icon
		? <Icon size={props.size} />
		: props.shouldRenderBlank && <div style={{width: props.size, height: props.size}} />;
};

ServiceIcon.willRenderIcon = ({type}) => Boolean(ServiceIcon.iconComponents[type]);

ServiceIcon.propTypes = {
	service: PropTypes.object,
	size: PropTypes.number,
	shouldRenderBlank: PropTypes.bool
};

ServiceIcon.iconComponents = {
	'camera': CameraIcon
};

export default ServiceIcon;
