import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import ServiceHeader from './ServiceHeader.js';
import styles from './ServiceCardBase.css';

export const ServiceCardBase = (props) => {
	const detailsPath = `${props.match.url}/service/${props.service.id}`;

	return (
		<section className={styles.card} onClick={props.onCardClick || (() => props.history.push(detailsPath))}>
			<div className={props.removePadding ? styles.topBarNone : props.hideToolbars ? styles.topBarHidden : styles.topBar}>
				<ServiceHeader
					service={props.service}
					name={props.name}
					status={props.status}
					isConnected={props.isConnected} />
			</div>
			<div className={props.toolbarsOverlayContent ? styles.contentBehindToolbars : styles.content}>
				{props.children}
			</div>
			<div className={props.removePadding ? styles.topBarNone : props.hideToolbars ? styles.bottomBarHidden : styles.bottomBar}>
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
