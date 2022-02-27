import React from 'react';
import PropTypes from 'prop-types';
import CameraCard from './CameraCard.js';
import DimmerCard from './DimmerCard.js';
import GrowPodCard from './GrowPodCard.js';
import LightCard from './LightCard.js';
import ScaleCard from './ScaleCard.js';
import ButtonCard from './ButtonCard.js';
import GlobalAlarmCard from './AlarmCardGlobal.js';
import GameMachineCard from './GameMachineCard.js';
import LockCard from './LockCard.js';
import ThermostatCard from './ThermostatCard.js';
import MediaCard from './MediaCard.js';

export const ServiceCard = (props) => {
	const Card = ServiceCard.cardComponents[props.service.type];

	return Card && <Card {...props} />;
};

ServiceCard.willCardRender = ({type}) => Boolean(ServiceCard.cardComponents[type]);

ServiceCard.propTypes = {
	service: PropTypes.object
};

ServiceCard.cardComponents = {
	'camera': CameraCard,
	'network-camera': CameraCard,
	'dimmer': DimmerCard,
	'grow-pod': GrowPodCard,
	'light': LightCard,
	'scale': ScaleCard,
	'global-alarm': GlobalAlarmCard,
	'button': ButtonCard,
	'game-machine': GameMachineCard,
	'lock': LockCard,
	'thermostat': ThermostatCard,
	'media': MediaCard
};

export default ServiceCard;
