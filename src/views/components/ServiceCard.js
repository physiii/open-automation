import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import DimmerCard from './DimmerCard.js';
import GameMachineCard from './GameMachineCard.js';
import LockCard from './LockCard.js';
import ThermostatCard from './ThermostatCard.js';

export const ServiceCard = (props) => {
	const Card = ServiceCard.cardComponents[props.service.type];

	return Card && <Card {...props} />;
};

ServiceCard.willCardRender = ({type}) => Boolean(ServiceCard.cardComponents[type]);

ServiceCard.propTypes = {
	service: PropTypes.object,
	parentPath: PropTypes.string
};

ServiceCard.cardComponents = {
	'camera': CameraCard,
	'dimmer': DimmerCard,
	'game-machine': GameMachineCard,
	'lock': LockCard,
	'thermostat': ThermostatCard
};

export default ServiceCard;
