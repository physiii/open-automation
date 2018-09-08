import React from 'react';
import PropTypes from 'prop-types';
import './Switch.css';

export const Switch = (props) => {
	const {isOn, ...inputProps} = {...props};

	return (
		<div styleName={'switch' + (isOn ? ' isOn' : '')}>
			<input
				{...inputProps}
				styleName="input"
				type="checkbox"
				checked={isOn} />
		</div>
	);
};

Switch.propTypes = {
	isOn: PropTypes.bool
};

Switch.defaultProps = {
	isOn: false
};

export default Switch;

