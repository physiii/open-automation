import React from 'react';
import PropTypes from 'prop-types';
import SettingsForm from './SettingsForm.js';
import withSettingsSaver from './withSettingsSaver.js';

export const ListFieldItemForm = (props) => {
	return (
		<SettingsForm
			disabled={props.disabled}
			onFieldChange={props.onSettingChange}>
			{Object.keys(props.settingsDefinitions).map((property) => {
				return {
					property,
					definition: props.settingsDefinitions[property],
					value: props.settings[property],
					error: props.settingsErrors[property],
					originalValue: props.originalSettings[property]
				};
			})}
		</SettingsForm>
	);
};

ListFieldItemForm.propTypes = {
	settingsDefinitions: PropTypes.object,
	settings: PropTypes.object,
	disabled: PropTypes.bool,
	settingsErrors: PropTypes.object,
	originalSettings: PropTypes.object,
	onSettingChange: PropTypes.func
};

export default withSettingsSaver(ListFieldItemForm);
