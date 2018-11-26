import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {formatUsd} from '../../utilities.js';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import './GameMachineCard.css';

export const SirenCard = (props) => {
	const lastSirenDate = props.service.state.state.last_siren_date;


	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Siren'}
			status={lastSirenDate && 'Siren detected ' + moment(lastSirenDate).fromNow()}
			isConnected={props.service.state.connected}
			secondaryAction={<Button to={`${props.match.url}/service-log/${props.service.id}`}>{props.service.settings.name || 'Siren'} Log</Button>}
			{...props}>
			<div>
				<center>
					<p>Siren is {(props.service.state.isOn ? 'on' : 'off')}</p>
				</center>
			</div>
		</ServiceCardBase>
	);
};

SirenCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(SirenCard);
