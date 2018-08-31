import React from 'react';
import PropTypes from 'prop-types';
import SettingsField from './SettingsField.js';

export const SettingsForm = (props) => {
	return (
		<form>
			{props.fields.map((field) => {
				return field && (
					<SettingsField
						{...field}
						onChange={props.onFieldChange}
						key={field.property} />
				);
			})}
		</form>
	);
};

SettingsForm.propTypes = {
	fields: PropTypes.arrayOf(PropTypes.shape({
		property: PropTypes.string,
		definition: PropTypes.object,
		value: PropTypes.any,
		originalValue: PropTypes.any
	})),
	onFieldChange: PropTypes.func
};

export default SettingsForm;
