import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from '../../utilities.js';
import TextField from './TextField.js';
import SwitchField from './SwitchField.js';
import SelectField from './SelectField.js';
import PercentageField from './PercentageField.js';
import EditableList from './EditableList.js';

export const SettingsField = (props) => {
	const fieldProps = {
		name: props.property,
		label: props.label || props.definition.label || props.property,
		value: props.value,
		disabled: props.disabled,
		onChange: props.onChange
	};

	switch (props.definition && props.definition.type) {
		case 'string':
		case 'integer':
		case 'number':
		case 'time-of-day':
			// TODO: Set text input type to number for integer/number settings.
			return (
				<TextField
					{...fieldProps}
					mask={isEmpty(props.value) && props.definition.validation.is_required ? props.originalValue : ''}
					error={props.error}
					onBlur={props.onChange}
					spellCheck="false" />
			);
		case 'boolean':
			return <SwitchField {...fieldProps} isOn={props.value} />;
		case 'one-of':
			return (
				<SelectField
					{...fieldProps}
					options={props.definition.value_options.map((option) => ({
						value: option.value,
						label: option.label || getUnitLabeledValue(option.value, props.definition.unit_label)
					}))} />
			);
		case 'percentage':
			return <PercentageField {...fieldProps} />;
		case 'list-of':
			return <EditableList {...fieldProps} itemFields={props.definition.item_properties} />;
		default:
			return null;
	}
};

const getUnitLabeledValue = (value, label) => {
	return value.toString && value.toString() + (label ? ' ' + label : '');
};

SettingsField.supportsFieldType = (type) => SettingsField.supportedFieldTypes.includes(type);

SettingsField.propTypes = {
	property: PropTypes.string.isRequired,
	definition: PropTypes.object.isRequired,
	label: PropTypes.string,
	value: PropTypes.any,
	originalValue: PropTypes.any,
	disabled: PropTypes.bool,
	onChange: PropTypes.func
};

SettingsField.supportedFieldTypes = [
	'string',
	'integer',
	'number',
	'boolean',
	'one-of',
	'list-of'
];

export default SettingsField;
