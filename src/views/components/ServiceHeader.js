import React from 'react';
import PropTypes from 'prop-types';
import ServiceIcon from '../icons/ServiceIcon.js';
import './ServiceHeader.css';

export const ServiceHeader = (props) => {
	const status = props.isConnected
		? props.status
		: 'Not Responding';

	return (
		<div styleName="header">
			{ServiceIcon.willRenderIcon(props.service) &&
				<div styleName={props.isConnected ? 'icon' : 'disconnectedIcon'}>
					<ServiceIcon service={props.service} size={40} />
				</div>}
			<div styleName="nameWrapper">
				<h1 styleName="name">
					{props.name}
				</h1>
				{status &&
					<span styleName={props.isConnected ? 'status' : 'disconnectedStatus'}>
						{status}
					</span>}
			</div>
		</div>
	);
};

ServiceHeader.propTypes = {
	service: PropTypes.object,
	name: PropTypes.string,
	status: PropTypes.string,
	isConnected: PropTypes.bool
};

export default ServiceHeader;
