import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import MetaList from './MetaList.js';
import Button from './Button.js';
import {formatUsd} from '../../utilities.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {getServiceByTypeAndDeviceId, getSettingsOptionLabelByValue} from '../../state/ducks/services-list/selectors.js';
import './GameMachineCard.css';

export const GameMachineCard = (props) => {
	const hopperLastEmptiedDate = moment(props.billAcceptorService.state.get('hopper_last_emptied')),
		hopperLastEmptied = props.billAcceptorService.state.get('hopper_last_emptied') && hopperLastEmptiedDate.isValid() && props.service.state.get('connected')
			? hopperLastEmptiedDate.format('h:mm a MMMM Do')
			: 'Unknown',
		billAcceptorDoorName = props.contactSensorService.settings.get('name') || 'Bill Acceptor Door';

	let billAcceptorDoorStatus = 'Unknown',
		status = props.service.settings.get('active_game') === 'game-board'
			? 'Game Board'
			: props.selectedArcadeGameLabel;

	if (props.contactSensorService.state.get('contact') === true && props.service.state.get('connected')) {
		billAcceptorDoorStatus = 'Closed';
	} else if (props.contactSensorService.state.get('contact') === false && props.service.state.get('connected')) {
		billAcceptorDoorStatus = 'Open';
		status = billAcceptorDoorName + ' Open';
	}

	return (
		<ServiceCardBase
			name={props.service.settings.get('name') || 'Game Machine'}
			status={status}
			isConnected={props.service.state.get('connected')}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.billAcceptorService.id}`}>{props.billAcceptorService.settings.get('name') || 'Bill Acceptor'} Log</Button>}
			{...props}>
			<div styleName="container">
				<section styleName="main">
					<span styleName="hopperTotal">{props.service.state.get('connected') ? formatUsd(props.billAcceptorService.state.get('hopper_total') || 0) : 'Unknown'}</span>
					<span styleName="hopperTotalDescription">collected since hopper was emptied.</span>
				</section>
				<MetaList layout="vertical" alignLabels="left" alignValuesRight={true}>
					{[
						{label: 'Hopper Last Emptied', value: hopperLastEmptied},
						{label: billAcceptorDoorName, value: billAcceptorDoorStatus}
					]}
				</MetaList>
			</div>
		</ServiceCardBase>
	);
};

GameMachineCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object,
	billAcceptorService: PropTypes.object,
	contactSensorService: PropTypes.object,
	selectedArcadeGameLabel: PropTypes.string
};

const mapStateToProps = ({servicesList}, {service}) => {
	return {
		billAcceptorService: getServiceByTypeAndDeviceId(servicesList, 'bill-acceptor', service.device_id, false),
		contactSensorService: getServiceByTypeAndDeviceId(servicesList, 'contact-sensor', service.device_id, false),
		selectedArcadeGameLabel: getSettingsOptionLabelByValue(servicesList, service.id, 'arcade_game', service.settings.get('arcade_game'))
	};
};

export default compose(
	connect(mapStateToProps),
	withRouter
)(GameMachineCard);
