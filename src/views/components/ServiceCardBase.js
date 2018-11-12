import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import './ServiceCardBase.css';

export const ServiceCardBase = (props) => {
	const settingsPath = `${props.match.url}/service/${props.service.id}`,
		status = props.isConnected
			? props.status
			: 'Not Responding';

	return (
		<section styleName="card" onClick={props.onCardClick || (() => props.history.push(settingsPath))}>
			<div styleName={props.hideToolbars ? 'topBarHidden' : 'topBar'}>
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
			<div styleName={props.toolbarsOverlayContent ? 'contentBehindToolbars' : 'content'}>
				{props.children}
			</div>
			<div styleName={props.hideToolbars ? 'bottomBarHidden' : 'bottomBar'}>
				<Toolbar
					leftChildren={<div onClick={(event) => event.stopPropagation()}>{props.secondaryAction}</div>}
					rightChildren={<div onClick={(event) => event.stopPropagation()}>
						<Button to={settingsPath}>Settings</Button>
					</div>} />
			</div>
		</section>
	);
};

ServiceCardBase.propTypes = {
	service: PropTypes.object,
	name: PropTypes.string,
	status: PropTypes.string,
	icon: PropTypes.node,
	isConnected: PropTypes.bool,
	children: PropTypes.node,
	toolbarsOverlayContent: PropTypes.bool,
	secondaryAction: PropTypes.node,
	hideToolbars: PropTypes.bool,
	onCardClick: PropTypes.func,
	match: PropTypes.object,
	history: PropTypes.object
};

export default withRouter(ServiceCardBase);
