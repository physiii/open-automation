import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import './DeviceCard.css';

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
		<div styleName="card">
			<div styleName="topBar">
				<Toolbar middleChildren={props.device.name || props.device.type} />
			</div>
			<div styleName="contentWithBarsOverlaid">
				{content}
			</div>
			<div styleName="bottomBar">
				<Toolbar rightChildren={props.device.type === 'camera'
					? <Button to={`${props.parentPath}/recordings/${props.device.id}`}>Recordings</Button>
					: null
				} />
			</div>
		</div>
	);
};

DeviceCard.propTypes = {
	device: PropTypes.object,
	parentPath: PropTypes.string
};

export default DeviceCard;
