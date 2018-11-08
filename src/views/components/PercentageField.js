import React from 'react';
import PropTypes from 'prop-types';
import SliderControl from './SliderControl.js';

export const PercentageField = (props) => {
	return (
		<SliderControl
			value={Math.round(props.value * 100)}
			tooltip={true}
			onChange={(value) => {
				if (typeof props.onChange !== 'function') {
					return;
				}

				props.onChange({
					type: 'change',
					target: {
						name: props.name,
						value: Math.round(value) / 100
					}
				});
			}}
			disabled={props.disabled} />
	);
};

PercentageField.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.number,
	disabled: PropTypes.bool,
	onChange: PropTypes.func
};

export default PercentageField;
