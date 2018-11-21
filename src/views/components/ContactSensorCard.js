import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {formatUsd} from '../../utilities.js';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import './GameMachineCard.css';

export const ContactSensorCard = (props) => {
	const lastContactDate = props.service.state.last_contact_date;


	return (
		<ServiceCardBase
			service={props.service}
			name={props.service.settings.name || 'Contact Sensor'}
			status={lastContactDate && 'Contact detected ' + moment(lastContactDate).fromNow()}
			isConnected={props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>{props.service.settings.name || 'Contact-Sensor'} Log</Button>}
			{...props}>
			<center>
			<h1>{props.service.state.contact}</h1>
			</center>

		</ServiceCardBase>
	);
};

ContactSensorCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(ContactSensorCard);
