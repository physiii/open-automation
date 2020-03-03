import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import ServiceHeader from './ServiceHeader.js';
import './ServiceCardBase.css';

export const ServiceCardBase = (props) => {
	const detailsPath = `${props.match.url}/service/${props.service.id}`;

	return (
		<section styleName="card" onClick={props.onCardClick || (() => props.history.push(detailsPath))}>
			<div styleName={props.removePadding ? 'topBarNone' : props.hideToolbars ? 'topBarHidden' : 'topBar'}>
				<ServiceHeader
					service={props.service}
					name={props.name}
					status={props.status}
					isConnected={props.isConnected} />
			</div>
			<div styleName={props.toolbarsOverlayContent ? 'contentBehindToolbars' : 'content'}>
				{props.children}
			</div>
			<div styleName={props.removePadding ? 'topBarNone' : props.hideToolbars ? 'bottomBarHidden' : 'bottomBar'}>
				<Toolbar
					leftChildren={<div onClick={(event) => event.stopPropagation()}>{props.secondaryAction}</div>}
					rightChildren={<div onClick={(event) => event.stopPropagation()}>
						<Button to={detailsPath}>Details</Button>
					</div>} />
			</div>
		</section>
	);
};

ServiceCardBase.propTypes = {
	service: PropTypes.object,
	name: PropTypes.string,
	status: PropTypes.string,
	isConnected: PropTypes.bool,
	children: PropTypes.node,
	toolbarsOverlayContent: PropTypes.bool,
	secondaryAction: PropTypes.node,
	hideToolbars: PropTypes.bool,
	removePadding: PropTypes.bool,
	onCardClick: PropTypes.func,
	match: PropTypes.object,
	history: PropTypes.object
};

export default withRouter(ServiceCardBase);
