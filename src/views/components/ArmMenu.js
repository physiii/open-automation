import React from 'react';
import PropTypes from 'prop-types';
import Button from '../components/Button.js';
import ShieldIcon from '../icons/ShieldIcon.js';
import ShieldCrossedIcon from '../icons/ShieldCrossedIcon.js';
import './ArmMenu.css';

const DISARMED = 0,
	ARMED_STAY = 1,
	ARMED_AWAY = 2;

export const ArmMenu = (props) => {
	const isArmedAway = props.mode === ARMED_AWAY,
		isArmedStay = props.mode === ARMED_STAY,
		isDisarmed = props.mode === DISARMED;

	return (
		<ul styleName="list">
			<li styleName={'option' + (isArmedAway ? ' active' : '')}>
				<Button
					type="tab"
					icon={<ShieldIcon shieldChecked={isArmedAway} size={24} />}
					onClick={() => props.setArmed(ARMED_AWAY)}>
					{isArmedAway || props.labelsAllOn ? 'Armed Away' : 'Arm Away'}
				</Button>
			</li>
			<li styleName={'option' + (isArmedStay ? ' active' : '')}>
				<Button
					type="tab"
					icon={<ShieldIcon shieldChecked={isArmedStay} size={24} />}
					onClick={() => props.setArmed(ARMED_STAY)}>
					{isArmedStay || props.labelsAllOn ? 'Armed Stay' : 'Arm Stay'}
				</Button>
			</li>
			<li styleName={'option' + (isDisarmed ? ' active' : '')}>
				<Button
					type="tab"
					icon={<ShieldCrossedIcon size={24} />}
					onClick={() => props.setArmed(DISARMED)}>
					{isDisarmed || props.labelsAllOn ? 'Disarmed' : 'Disarm'}
				</Button>
			</li>
		</ul>
	);
};

ArmMenu.propTypes = {
	mode: PropTypes.number,
	labelsAllOn: PropTypes.bool,
	setArmed: PropTypes.func.isRequired
};

export default ArmMenu;
