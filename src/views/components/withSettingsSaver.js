import React from 'react';
import PropTypes from 'prop-types';
import FormValidator from '../form-validation.js';
import {isEmpty} from '../../utilities.js';
import {debounce} from 'debounce';
import hoistNonReactStatics from 'hoist-non-react-statics';

const SAVE_DEBOUNCE_DELAY = 1000,
	TAG = '[withSettingsSaver]',
	noOp = () => { /* no-op */ },
	withSettingsSaver = (WrappedComponent) => {
		class SettingsSaver extends React.Component {
			constructor (props) {
				super(props);

				let values;

				if (this.props.fieldName) { // Single setting
					values = {
						[this.props.fieldName]: this.props.value
					};
				} else { // Group of settings
					values = {...this.props.values};
				}

				this.state = {
					values,
					formState: values,
					saved: SettingsSaver.getSavedStateOfFields(values, this.props),
					validationErrors: {}
				};
				this.originalValues = {...values};

				this.validator = new FormValidator(this.state.values);
				this.setValidationRules();

				this.handleFieldChange = this.handleFieldChange.bind(this);
				this.saveSettings = debounce(this.saveSettings.bind(this), SAVE_DEBOUNCE_DELAY);
			}

			static getSavedStateOfFields (values, props) {
				const savedState = {};

				if (props.fieldName) {
					savedState[props.fieldName] = SettingsSaver.areFieldValuesTheSame(values[props.fieldName], props.value);
				} else {
					Object.keys(props.fields).forEach((fieldName) => {
						savedState[fieldName] = SettingsSaver.areFieldValuesTheSame(values[fieldName], props.values[fieldName]);
					});
				}

				return savedState;
			}

			static getDerivedStateFromProps (props, state) {
				const values = props.fieldName
						? {[props.fieldName]: props.value}
						: {...props.values},
					formState = {...values},
					saved = SettingsSaver.getSavedStateOfFields(values, props); // TODO: This seems to be always setting all fields to saved. Is this right?

				Object.keys(values).forEach((fieldName) => {
					values[fieldName] = state.saved[fieldName]
						? values[fieldName]
						: state.values[fieldName];

					formState[fieldName] = state.saved[fieldName]
						? formState[fieldName]
						: state.formState[fieldName];
				});

				return {
					values,
					formState,
					saved
				};
			}

			static areFieldValuesTheSame (value1, value2) {
				return JSON.stringify(value1) === JSON.stringify(value2);
			}

			componentDidMount () {
				this.checkIfSaveable(false);
			}

			componentDidUpdate (previousProps, previousState) {
				this.setValidationRules();

				if (!this.state.shouldSave) {
					return;
				}

				const values = {...this.state.values};

				let anyValueDiffers = false;

				// Find changes and errors in current settings state.
				Object.keys(values).forEach((fieldName) => {
					const lastSavedValue = this.props.fieldName
						? this.props.value // Single setting
						: this.props.values[fieldName]; // Group of settings;

					if (this.state.validationErrors[fieldName]) {
						values[fieldName] = lastSavedValue;
					}

					if (values[fieldName] !== lastSavedValue) {
						anyValueDiffers = true;
					}
				});

				if (anyValueDiffers) {
					this.saveSettings({...values});
				}

				this.checkIfSaveable(this.validator.hasErrors(previousState.validationErrors));
			}

			componentWillUnmount () {
				this.saveSettings.flush();
			}

			checkIfSaveable (hasExistingErrors) {
				const errors = this.validator.getValidationErrors(this.state.values),
					hasErrors = this.validator.hasErrors(errors);

				if (hasErrors && !hasExistingErrors) {
					this.props.onError(errors);
				} else if (!hasErrors && hasExistingErrors) {
					this.props.onNoError();
				}
			}

			setValidationRules () {
				// Add fields to validator.
				if (this.props.fieldName) { // Single setting
					this.addSettingValidation(this.props.fieldName, this.props.field);
				} else { // Group of settings
					Object.keys(this.props.fields).forEach((fieldName) => {
						this.addSettingValidation(fieldName, this.props.fields[fieldName]);
					});
				}
			}

			addSettingValidation (fieldName, field) {
				const _field = {...field};

				// Add validation for the field type.
				_field.validation = {
					[field.type]: true,
					...field.validation
				};

				this.validator.field(fieldName, _field.label, _field.validation);
			}

			handleSettingsChange (value) {

				this.props.values.show_on_dashboard = false;
				if (this.props.values.show_on_dashboard === true) {
					this.props.values.show_on_dashboard = value;
				}

				console.log(TAG, 'handleSettingsChange', this.props.values);
				this.saveSettings(this.props.values);
			}

			handleFieldChange (event) {

				let value = this.getValueFromEvent(event);

				console.log('handleFieldChange', value);
				// this.handleSettingsChange(value);
				const fieldName = event.target.name,
					field = this.props.fieldName
						? this.props.field // Single setting
						: this.props.fields[fieldName]; // Group of settings

				let shouldSave = event.type === 'change';

				// If required field is unset, reset to the original value.
				if (isEmpty(value) && field.validation && field.validation.is_required) {
					value = this.originalValues[fieldName];

					// Don't save the original value until field is blurred.
					shouldSave = event.type === 'blur';
				}

				const values = {
					...this.state.values,
					[fieldName]: value
				};

				this.setState({
					values,
					shouldSave,
					saved: SettingsSaver.getSavedStateOfFields(values, this.props),
					validationErrors: this.validateField(fieldName, value),
					formState: {
						...this.state.formState,
						[fieldName]: event.type === 'change'
							? this.getValueFromEvent(event, false) // Keep the exact value from the input until the user stops editing.
							: value
					}
				});
			}

			validateField (fieldName, value) {
				this.validator.setState({
					...this.state.values,
					[fieldName]: value
				});

				return this.validator.validateField(fieldName);
			}

			getValueFromEvent (event, normalize = true) {
				const field = this.props.fieldName
					? this.props.field
					: this.props.fields[event.target.name];

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

			saveSettings (values) {
				if (!values) {
					// Workaround for a bug where debouncing saveSettings
					// sometimes causes erroneous saveSettings calls with
					// values undefined.
					return;
				}

				if (this.props.fieldName) {
					this.props.saveSettings(values[this.props.fieldName]);
					this.props.onSaveableChange(values[this.props.fieldName]);
				} else {
					this.props.saveSettings(values);
					this.props.onSaveableChange(values);
				}
			}

			render () {
				return (
					<WrappedComponent
						{...this.props}
						values={this.state.formState}
						value={this.state.formState[this.props.fieldName]}
						error={this.state.validationErrors[this.props.fieldName]}
						errors={this.state.validationErrors}
						originalValue={this.originalValues[this.props.fieldName]}
						originalValues={this.originalValues}
						onSettingChange={this.handleFieldChange} />
				);
			}
		}

		SettingsSaver.propTypes = {
			saveSettings: PropTypes.func,
			onSaveableChange: PropTypes.func,
			onNoError: PropTypes.func,
			onError: PropTypes.func,
			// Single setting
			fieldName: PropTypes.string,
			field: PropTypes.object,
			value: PropTypes.any,
			// Group of settings
			fields: PropTypes.object,
			values: PropTypes.object
		};

		SettingsSaver.defaultProps = {
			values: {},
			fields: {},
			saveSettings: noOp,
			onSaveableChange: noOp,
			onNoError: noOp,
			onError: noOp
		};

		return hoistNonReactStatics(SettingsSaver, WrappedComponent);
	};

export default withSettingsSaver;
