import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import {sirenSetTest} from '../../state/ducks/services-list/operations.js';
import './GameMachineCard.css';

export const SirenCard = (props) => {
	const lastSirenDate = props.service.state.last_siren_date,
		toggleTest = () => {
			props.setTest(props.service.id, 'testSiren/set');
		};

	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Siren'}
			status={lastSirenDate && 'Siren detected ' + moment(lastSirenDate).fromNow()}
			isConnected={props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>History</Button>}
			{...props}>
			<div>
				<center>
					<p>Siren is {(props.service.state.isOn ? 'on' : 'off')}</p>
					<Button onClick={toggleTest}>Test Siren</Button>
				</center>
			</div>
		</ServiceCardBase>
	);
};

SirenCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object,
	setTest: PropTypes.func
};
const mapDispatchToProps = (dispatch) => {
	return {
		setTest: (serviceId) => dispatch(sirenSetTest(serviceId))
	};
};

export default compose(
	connect(null, mapDispatchToProps),
	withRouter
)(SirenCard);
