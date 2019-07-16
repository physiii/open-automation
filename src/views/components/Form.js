import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField.js';
import FormValidator from '../form-validation.js';
import {noOp, isEmpty, areValuesTheSame} from '../../utilities.js';
import {debounce} from 'debounce';
import './Form.css';

const SAVEABLE_DEBOUNCE_DELAY = 500;

export class Form extends React.Component {
	constructor (props) {
		super(props);

		// Remove any values for fields not listed in props.fields.
		const values = Object.keys(this.props.fields).reduce((_values, fieldName) => ({
			..._values,
			[fieldName]: this.props.values[fieldName]
		}), {});

		this.originalValues = {...values};
		this.state = {
			values,
			formValues: values,
			validationErrors: {}
		};

		this.validator = new FormValidator(this.state.values);
		this.setValidationRules();

		this.handleFieldChange = this.handleFieldChange.bind(this);
		this.handleSaveableChange = debounce(this.handleSaveableChange.bind(this), SAVEABLE_DEBOUNCE_DELAY);
	}

	componentDidUpdate (previousProps, previousState) {
		this.setValidationRules();

		const anyValueChanges = Object.keys(this.state.values).some((fieldName) => {
				return !areValuesTheSame(this.state.values[fieldName], previousState.values[fieldName]);
			}),
			hasErrors = this.validator.hasErrors(this.state.validationErrors),
			hadExistingErrors = this.validator.hasErrors(previousState.validationErrors);

		if (!anyValueChanges) {
			return;
		}

		// Check for a change in the form's error state.
		if (hasErrors && !hadExistingErrors) {
			this.props.onError({...this.state.validationErrors});
		} else if (!hasErrors && hadExistingErrors) {
			this.props.onNoError();
		}

		if (!hasErrors) {
			this.handleSaveableChange({...this.state.values});
		}
	}

	componentWillUnmount () {
		this.handleSaveableChange.flush();
	}

	setValidationRules () {
		// Add fields to validator.
		Object.keys(this.props.fields).forEach((fieldName) => {
			const field = this.props.fields[fieldName];

			this.validator.field(
				fieldName,
				field.label,
				{
					[field.type]: true, // Add validation for the field type.
					...field.validation
				}
			);
		});
	}

	handleFieldChange (event) {
		let value = this.getValueFromEvent(event);

		const fieldName = event.target.name,
			field = this.props.fields[fieldName];

		// If required field is unset, reset to the original value.
		if (isEmpty(value) && field.validation && field.validation.is_required && event.type === 'blur') {
			value = this.originalValues[fieldName];
		}

		this.setState({
			values: {
				...this.state.values,
				[fieldName]: value
			},
			formValues: {
				...this.state.formValues,
				[fieldName]: event.type === 'change'
					? this.getValueFromEvent(event, false) // Keep the exact value from the input until the user stops editing.
					: value
			},
			validationErrors: this.validateField(fieldName, value)
		});
	}

	getValueFromEvent (event, normalize = true) {
		const field = this.props.fields[event.target.name];

		switch (field && field.type) {
			case 'integer':
			case 'number':
				if (!normalize) {
					return event.target.value;
				}

				if (event.target.value) {
					return !isEmpty(Number(event.target.value))
						? Number(event.target.value)
						: event.target.value;
				}

				return null;
			case 'boolean':
				return event.target.checked;
			case 'one-of':
				return field.value_options.find((option) => option.value.toString() === event.target.value).value;
			case 'string':
				return normalize
					? event.target.value.trim()
					: event.target.value;
			default:
				return event.target.value;
		}
	}

	validateField (fieldName, value) {
		this.validator.setState({
			...this.state.values,
			[fieldName]: value
		});

		return this.validator.validateField(fieldName);
	}

	handleSaveableChange (values) {
		if (!values) {
			// Workaround for a bug where debouncing saveSettings
			// sometimes causes erroneous saveSettings calls with
			// values undefined.
			return;
		}

		this.props.onSaveableChange(values);
	}

	render () {
		return (
			<form styleName="form">
				{Object.keys(this.props.fields).map((fieldName) => (
					<FormField
						property={fieldName}
						definition={this.props.fields[fieldName]}
						value={this.state.formValues[fieldName]}
						originalValue={this.originalValues[fieldName]}
						error={this.state.validationErrors[fieldName]}
						disabled={this.props.disabled}
						onChange={this.handleFieldChange}
						key={fieldName} />
				))}
			</form>
		);
	}
}

Form.willAnyFieldsRender = (fields = {}) => {
	for (const property of Object.keys(fields)) {
		const field = fields[property];

		if (FormField.supportsFieldType(field && field.type)) {
			return true;
		}
	}

	return false;
};

Form.propTypes = {
	fields: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	values: PropTypes.object.isRequired,
	onSaveableChange: PropTypes.func,
	onError: PropTypes.func,
	onNoError: PropTypes.func
};

Form.defaultProps = {
	values: {},
	fields: {},
	onSaveableChange: noOp,
	onNoError: noOp,
	onError: noOp
};

export default Form;
