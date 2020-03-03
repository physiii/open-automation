import React from 'react';
import PropTypes from 'prop-types';
import './Switch.css';

export const Switch = (props) => {
	const {isOn, showLabels, offLabel, onLabel, ...inputProps} = {...props};

	return (
		<div styleName={'container' + (props.disabled ? ' isDisabled' : '')}>
			{showLabels && <span styleName="offLabel">{offLabel}</span>}
			<span styleName={'switch' + (isOn ? ' isOn' : '')}>
				<input
					{...inputProps}
					styleName="input"
					type="checkbox"
					checked={isOn} />
			</span>
			{showLabels && <span styleName="onLabel">{onLabel}</span>}
		</div>
	);
};

Switch.propTypes = {
	isOn: PropTypes.bool,
	showLabels: PropTypes.bool,
	offLabel: PropTypes.string,
	onLabel: PropTypes.string,
	disabled: PropTypes.bool
};

Switch.defaultProps = {
	isOn: false,
	offLabel: 'Off',
	onLabel: 'On'
};

export default Switch;
