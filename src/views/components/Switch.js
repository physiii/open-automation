import React from 'react';
import PropTypes from 'prop-types';
import styles from './Switch.css';

export const Switch = (props) => {
	const {isOn, showLabels, offLabel, onLabel, ...inputProps} = {...props};

	return (
		<div className={styles.container + (props.disabled ? ' isDisabled' : '')}>
			{showLabels && <span className={styles.offLabel}>{offLabel}</span>}
			<span className={styles.switch + (isOn ? ' ' + styles.isOn : '')}>
				<input
					{...inputProps}
					className={styles.input}
					type="checkbox"
					checked={isOn} />
			</span>
			{showLabels && <span className={styles.onLabel}>{onLabel}</span>}
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
