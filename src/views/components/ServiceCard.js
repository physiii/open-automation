import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import LockCard from './LockCard.js';

export const ServiceCard = (props) => {
	switch (props.service.type) {
		case 'camera':
			return <CameraCard camera={props.service} parentPath={props.parentPath} />;
		case 'lock':
			return <LockCard lockService={props.service} parentPath={props.parentPath} />;
		default:
			return null;
	}
};

ServiceCard.willRenderCard = (props) => Boolean(ServiceCard(props));

ServiceCard.propTypes = {
	service: PropTypes.object,
	parentPath: PropTypes.string
};

export default ServiceCard;
