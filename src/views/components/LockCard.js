import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';
import {lockLock, lockUnlock} from '../../state/ducks/services-list/operations.js';

export const LockCard = (props) => {
	const isLocked = props.service.state.locked,
		toggleLock = () => {
			if (isLocked) {
				props.unlock(props.service.id);
			} else {
				props.lock(props.service.id);
			}
		};

	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Lock'}
			status={props.service.state.locked ? 'Locked' : 'Unlocked'}
			isConnected={props.service.state.connected}
			{...props}>
			<Button onClick={toggleLock}>{props.service.state.locked ? 'Unlock' : 'Lock'}</Button>
		</ServiceCardBase>
	);
};

LockCard.propTypes = {
	service: PropTypes.object,
	lock: PropTypes.func,
	unlock: PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
	return {
		lock: (serviceId) => dispatch(lockLock(serviceId)),
		unlock: (serviceId) => dispatch(lockUnlock(serviceId))
	};
};

export default connect(null, mapDispatchToProps)(LockCard);
