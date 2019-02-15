import React from 'react';
import PropTypes from 'prop-types';
import SettingsField from './SettingsField.js';
import withSettingsSaver from './withSettingsSaver.js';
import './SettingsForm.css';

export const SettingsForm = (props) => {
	return (
		<form styleName="form">
			{Object.keys(props.fields).map((fieldName) => (
				<SettingsField
					property={fieldName}
					definition={props.fields[fieldName]}
					value={props.values[fieldName]}
					originalValue={props.originalValues[fieldName]}
					error={props.errors[fieldName]}
					disabled={props.disabled}
					onChange={props.onSettingChange}
					key={fieldName} />
			))}
		</form>
	);
};

SettingsForm.willAnyFieldsRender = (fields = {}) => {
	for (const property of Object.keys(fields)) {
		const field = fields[property];

		if (SettingsField.supportsFieldType(field && field.type)) {
			return true;
		}
	}

	return false;
};

SettingsForm.propTypes = {
	fields: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	// Props from settings saver HOC.
	values: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	originalValues: PropTypes.object.isRequired,
	onSettingChange: PropTypes.func.isRequired
};

SettingsForm.defaultProps = {
	errors: {}
};

export default withSettingsSaver(SettingsForm);
