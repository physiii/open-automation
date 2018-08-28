import React from 'react';
import PropTypes from 'prop-types';
import CameraIcon from '../icons/CameraIcon.js';

export const ServiceIcon = (props) => {
	switch (props.service && props.service.type) {
		case 'camera':
			return <CameraIcon size={props.size} />;
		default:
			return props.shouldRenderBlank ? <div style={{width: props.size, height: props.size}} /> : null;
	}
};

ServiceIcon.willRenderIcon = (props) => Boolean(ServiceIcon(props));

ServiceIcon.propTypes = {
	service: PropTypes.object,
	size: PropTypes.number,
	shouldRenderBlank: PropTypes.bool
};

export default ServiceIcon;
