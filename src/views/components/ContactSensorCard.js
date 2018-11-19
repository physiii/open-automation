import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';

export const ContactSensorCard = (props) => {
	const isOpen = props.service.state.contact,
		lastContactDate = this.props.service.state.last_contact_date;


	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Contact Sensor'}
			status={lastContactDate && 'Contact detected ' + moment(lastContactDate).fromNow()}
			isConnected={this.props.service.state.connected}
			//secondaryAction={<Button to={`${this.props.match.url}/Contact-History/${this.props.service.id}`}>View Logs</Button>}
		</ServiceCardBase>
	);
};

ContactSensorCard.propTypes = {
	service: PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
	return;
};

export default connect(null, mapDispatchToProps)(ContactSensorCard);
