import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from '../../utilities.js';
import TextField from './TextField.js';
import SwitchField from './SwitchField.js';
import SelectField from './SelectField.js';
import TimeField from './TimeField.js';
import PercentageField from './PercentageField.js';
import ListField from './ListField.js';

export const FormField = (props) => {
	const fieldProps = {
		name: props.property,
		label: props.label || props.definition.label || props.property,
		value: props.value,
		disabled: props.disabled || props.definition.disabled,
		onChange: props.onChange
	};

	switch (props.definition && props.definition.type) {
		case 'string':
		case 'integer':
		case 'number':
		case 'long-string':
			// TODO: Set text input type to number for integer/number fields.
			return (
				<TextField
					{...fieldProps}
					type={props.definition.type === 'long-string' ? 'textarea' : null}
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
		case 'time-of-day':
			return <TimeField {...fieldProps} />;
		case 'percentage':
			return <PercentageField {...fieldProps} />;
		case 'list-of':
			return (
				<ListField
					{...fieldProps}
					itemFields={props.definition.item_properties.toJS()}
					mainProperty={props.definition.main_property}
					secondaryProperty={props.definition.secondary_property} />
			);
		default:
			return null;
	}
};

const getUnitLabeledValue = (value, label) => {
	return value.toString && value.toString() + (label ? ' ' + label : '');
};

FormField.supportsFieldType = (type) => FormField.supportedFieldTypes.includes(type);

FormField.propTypes = {
	property: PropTypes.string.isRequired,
	definition: PropTypes.object.isRequired,
	label: PropTypes.string,
	value: PropTypes.any,
	originalValue: PropTypes.any,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	onChange: PropTypes.func
};

FormField.supportedFieldTypes = [
	'string',
	'integer',
	'number',
	'boolean',
	'one-of',
	'list-of'
];

export default FormField;
