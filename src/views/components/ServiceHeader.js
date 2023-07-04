import React from 'react';
import PropTypes from 'prop-types';
import ServiceIcon from '../icons/ServiceIcon.js';
import styles from './ServiceHeader.css';

export const ServiceHeader = (props) => {
	const status = props.isConnected
		? props.status
		: 'Not Responding';

	return (
		<div className={styles.header}>
			{ServiceIcon.willRenderIcon(props.service) &&
				<div className={props.isConnected ? styles.icon : styles.disconnectedIcon}>
					<ServiceIcon service={props.service} size={40} />
				</div>}
			<div className={styles.nameWrapper}>
				<h1 className={styles.name}>
					{props.name || props.service.settings.get('name') || props.service.strings.get('friendly_type')}
				</h1>
				{status &&
					<span className={props.isConnected ? styles.status : styles.disconnectedStatus}>
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
