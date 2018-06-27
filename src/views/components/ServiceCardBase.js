import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from './Toolbar.js';
import './ServiceCardBase.css';

export const ServiceCardBase = (props) => {
	const status = props.isConnected
		? props.status
		: 'Not Responding';

	return (
		<div styleName="card">
			<div styleName={props.hideToolbars ? 'topBarHidden' : 'topBar'}>
				{props.icon
					? <div styleName={props.isConnected ? 'icon' : 'disconnectedIcon'}>
						{props.icon}
					</div>
					: null}
				<div styleName="nameWrapper">
					<label styleName="name">
						{props.name}
					</label>
					{status
						? <div styleName={props.isConnected ? 'status' : 'disconnectedStatus'}>
							{status}
						</div>
						: null}
				</div>
			</div>
			<div styleName={props.toolbarsOverlayContent ? 'contentBehindToolbars' : 'content'}>
				{props.content}
			</div>
			<div styleName={props.hideToolbars ? 'bottomBarHidden' : 'bottomBar'}>
				<Toolbar leftChildren={props.secondaryAction} />
			</div>
		</div>
	);
};

ServiceCardBase.propTypes = {
	name: PropTypes.string,
	status: PropTypes.string,
	icon: PropTypes.node,
	isConnected: PropTypes.bool,
	content: PropTypes.node,
	toolbarsOverlayContent: PropTypes.bool,
	secondaryAction: PropTypes.node,
	hideToolbars: PropTypes.bool
};

export default ServiceCardBase;
