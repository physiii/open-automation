import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import './GameMachineCard.css';

export const ContactSensorCard = (props) => {
	const lastContactDate = props.service.state.last_contact_date,
		currentState = props.service.state.contact;


	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Contact Sensor'}
			status={lastContactDate && currentState + ' detected ' + moment(lastContactDate).fromNow()}
			isConnected={props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>History</Button>}
			{...props}>
			<center>
				<p>Currently {(props.service.state.connected ? currentState : 'disconnected')}</p>
			</center>

		</ServiceCardBase>
	);
};

ContactSensorCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(ContactSensorCard);
