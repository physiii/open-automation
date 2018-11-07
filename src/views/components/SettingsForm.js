import React from 'react';
import PropTypes from 'prop-types';
import SettingsField from './SettingsField.js';
import './SettingsForm.css';

export const SettingsForm = (props) => {
	return (
		<form styleName="form">
			{props.children.map((field) => {
				return field && (
					<SettingsField
						{...field}
						disabled={props.disabled}
						onChange={props.onFieldChange}
						key={field.property} />
				);
			})}
		</form>
	);
};

SettingsForm.willAnyFieldsRender = (fields = []) => {
	for (const field of fields) {
		if (SettingsField.supportsFieldType(field && field.definition && field.definition.type)) {
			return true;
		}
	}

	return false;
};

SettingsForm.propTypes = {
	children: PropTypes.arrayOf(PropTypes.shape({
		property: PropTypes.string,
		definition: PropTypes.object,
		value: PropTypes.any,
		originalValue: PropTypes.any
	})),
	disabled: PropTypes.bool,
	onFieldChange: PropTypes.func
};

export default SettingsForm;
