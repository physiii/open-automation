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

export const ContactSensorCard = (props) => {
	const isOpen = props.service.state.contact,
		lastContactDate = this.props.service.state.last_contact_date;


	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Contact Sensor'}
			status={lastContactDate && 'Contact detected ' + moment(lastContactDate).fromNow()}
			isConnected={this.props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>{props.service.settings.name || 'Contact-Sensor'} Log</Button>}
			{...props}>
			<div styleName="container">
				<section styleName="main">
					<span styleName="hopperTotal">{props.service.state.connected ? formatUsd(props.service.state.contact || 'Unknown') : 'Unknown'}</span>
				</section>
			</div>
		</ServiceCardBase>
	);
};

ContactSensorCard.propTypes = {
	service: PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
	return {
		contactSensorService: getServiceByTypeAndDeviceId(servicesList, 'contact-sensor', service.device_id)
	};
};

export default connect(null, mapDispatchToProps)(ContactSensorCard);
