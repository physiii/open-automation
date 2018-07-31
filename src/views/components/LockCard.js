import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';
import {lockLock, lockUnlock} from '../../state/ducks/services-list/operations.js';

export const LockCard = (props) => {
	const isLocked = props.lockService.state.locked,
		toggleLock = () => {
			if (isLocked) {
				props.unlock(props.lockService.id);
			} else {
				props.lock(props.lockService.id);
			}
		};

	return (
		<ServiceCardBase
			name={props.lockService.settings.name || 'Lock'}
			status={props.lockService.state.locked ? 'Locked' : 'Unlocked'}
			isConnected={props.lockService.state.connected}
			content={<Button onClick={toggleLock}>{props.lockService.state.locked ? 'Unlock' : 'Lock'}</Button>} />
	);
};

LockCard.propTypes = {
	lockService: PropTypes.object,
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
