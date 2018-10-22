import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import LockCard from './LockCard.js';
import ThermostatCard from './ThermostatCard.js';
import GameMachineCard from './GameMachineCard.js';

export const ServiceCard = (props) => {
	const Card = ServiceCard.cardComponents[props.service.type];

	return Card && <Card {...props} />;
};

ServiceCard.willRenderCard = ({type}) => Boolean(ServiceCard.cardComponents[type]);

ServiceCard.propTypes = {
	service: PropTypes.object,
	parentPath: PropTypes.string
};

ServiceCard.cardComponents = {
	'camera': CameraCard,
	'lock': LockCard,
	'thermostat': ThermostatCard,
	'game-machine': GameMachineCard
};

export default ServiceCard;
