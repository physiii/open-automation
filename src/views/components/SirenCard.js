import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';

export const SirenCard = (props) => {
	const isSirenOn = props.service.state.isOn,
		lastContactDate = this.props.service.state.last_contact_date;


	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Siren'}
			status={lastContactDate && 'Siren detected ' + moment(lastContactDate).fromNow()/+}
			isConnected={this.props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>{props.service.settings.name || 'Siren'} Log</Button>}
			{...props}>
			<div styleName="container">
				<section styleName="main">
					<span styleName="hopperTotal">{props.service.state.connected ? formatUsd(props.service.state.isOn || 'Unknown') : 'Unknown'}</span>
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
		sirenService: getServiceByTypeAndDeviceId(servicesList, siren, service.device_id)
	};
};

export default connect(null, mapDispatchToProps)(ContactSensorCard);
