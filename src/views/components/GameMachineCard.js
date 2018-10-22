import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import MetaList from './MetaList.js';
import {formatUsd} from '../../utilities.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {getServiceByTypeAndDeviceId, getSettingsOptionLabelByValue} from '../../state/ducks/services-list/selectors.js';
import './GameMachineCard.css';

export const GameMachineCard = (props) => {
	const hopperLastEmptiedDate = moment(props.billAcceptorService.state.hopper_last_emptied),
		hopperLastEmptied = hopperLastEmptiedDate.isValid() && props.service.state.connected
			? hopperLastEmptiedDate.format('h:mm a MMMM Do')
			: 'Unknown',
		billAcceptorDoorName = props.contactSensorService.settings.name || 'Bill Acceptor Door';

	let billAcceptorDoorStateString = 'Unknown',
		status = props.service.settings.active_game === 'game-board'
			? 'Game Board'
			: props.selectedArcadeGameLabel;

	if (props.contactSensorService.state.contact === true && props.service.state.connected) {
		billAcceptorDoorStateString = 'Closed';
	} else if (props.contactSensorService.state.contact === false && props.service.state.connected) {
		billAcceptorDoorStateString = 'Open';
		status = billAcceptorDoorName + ' Open';
	}

	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Game Machine'}
			status={status}
			isConnected={props.service.state.connected}
			{...props}>
			<div styleName="container">
				<section styleName="main">
					<span styleName="hopperTotal">{props.service.state.connected ? formatUsd(props.billAcceptorService.state.hopper_total || 0) : 'Unknown'}</span>
					<span styleName="hopperTotalDescription">collected since hopper was emptied.</span>
				</section>
				<MetaList layout="vertical" alignLabels="left" alignValuesRight={true}>
					{[
						{label: 'Hopper Last Emptied', value: hopperLastEmptied},
						{label: billAcceptorDoorName, value: billAcceptorDoorStateString}
					]}
				</MetaList>
			</div>
		</ServiceCardBase>
	);
};

GameMachineCard.propTypes = {
	service: PropTypes.object,
	billAcceptorService: PropTypes.object,
	contactSensorService: PropTypes.object,
	selectedArcadeGameLabel: PropTypes.string
};

const mapStateToProps = ({servicesList}, {service}) => {
	return {
		billAcceptorService: getServiceByTypeAndDeviceId(servicesList, 'bill-acceptor', service.device_id),
		contactSensorService: getServiceByTypeAndDeviceId(servicesList, 'contact-sensor', service.device_id),
		selectedArcadeGameLabel: getSettingsOptionLabelByValue(servicesList, service.id, 'arcade_game', service.settings.arcade_game)
	};
};

export default connect(mapStateToProps)(GameMachineCard);
