import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import '../styles/modules/_Card.scss';

export const DeviceCard = (props) => {
	let content;

	switch (props.device.type) {
		case 'camera':
			content = <CameraCard camera={props.device} />;
			break;
		default:
			content = null;
	}

	return (
		<div className="oa-Card">
			<div className="oa-Card--toolbar">
				<Toolbar middleChildren={props.device.name || props.device.type} />
			</div>
			<div className="oa-Card--content">
				{content}
			</div>
			<div className="oa-Card--toolbar">
				<Toolbar rightChildren={<Button>Dashboard</Button>} />
			</div>
		</div>
	);
};

DeviceCard.propTypes = {
	device: PropTypes.object
};

export default DeviceCard;
