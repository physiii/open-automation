import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from '../../utilities.js';
import TextField from './TextField.js';
import Checkbox from './Checkbox.js';
import SelectList from './SelectList.js';

export const SettingsField = (props) => {
	const fieldProps = {
		name: props.property,
		label: props.label || props.definition.label || props.property,
		onChange: props.onChange
	};

	switch (props.definition && props.definition.type) {
		case 'string':
		case 'integer':
		case 'number':
			// TODO: Set text input type to number for integer/number settings.
			return (
				<TextField
					{...fieldProps}
					value={props.value}
					mask={isEmpty(props.value) && props.definition.validation.is_required ? props.originalValue : ''}
					onBlur={props.onChange} />
			);
		case 'boolean':
			return (
				<Checkbox {...fieldProps} checked={props.value} />
			);
		case 'one-of':
			return (
				<SelectList
					{...fieldProps}
					value={props.value}
					options={props.definition.value_options.map((option) => ({
						value: option.value,
						label: option.label || getUnitLabeledValue(option.value, props.definition.unit_label)
					}))} />
			);
		default:
			return null;
	}
};

const getUnitLabeledValue = (value, label) => {
	return value.toString && value.toString() + (label ? ' ' + label : '');
};

SettingsField.propTypes = {
	property: PropTypes.string.isRequired,
	definition: PropTypes.object.isRequired,
	label: PropTypes.string,
	value: PropTypes.any,
	originalValue: PropTypes.any,
	onChange: PropTypes.func
};

export default SettingsField;
