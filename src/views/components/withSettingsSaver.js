import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {debounce} from 'debounce';
import {isEmpty} from '../../utilities.js';

const SAVE_DEBOUNCE_DELAY = 500,
	withSettingsSaver = (WrappedComponent) => {
		class SettingsSaver extends React.Component {
			constructor (props) {
				super(props);

				this.state = {
					settings: {...this.props.settings}
				};

				this.originalSettings = {...props.settings};

				this.handleFieldChange = this.handleFieldChange.bind(this);
				this.setSettings = debounce(this.setSettings, SAVE_DEBOUNCE_DELAY);
			}

			handleFieldChange (event) {
				const value = this.getValueFromEvent(event),
					property = event.target.name,
					definition = this.props.settings_definitions[property],
					settings = {
						...this.state.settings,
						[property]: value
					};

				let shouldSaveSettings = event.type === 'change';

				// If required field is unset, reset to the original value on blur.
				if (isEmpty(settings[property]) && definition.validation.is_required) {
					if (event.type === 'blur') {
						settings[property] = this.originalSettings[property];

						// Only save if value is different from last saved value.
						shouldSaveSettings = settings[property] !== this.props.settings[property];
					} else if (event.type === 'change') {
						shouldSaveSettings = false;
					}
				}

				this.setState({settings});

				if (shouldSaveSettings) {
					this.setSettings(settings);
				}
			}

			getValueFromEvent (event) {
				const definition = this.props.settings_definitions[event.target.name];

				switch (definition && definition.type) {
					case 'integer':
					case 'number':
						return event.target.value ? Number(event.target.value) : null;
					case 'boolean':
						return event.target.checked;
					case 'one-of':
						return definition.value_options.find((option) => option.value.toString() === event.target.value).value;
					default:
						return event.target.value;
				}
			}

			setSettings (settings) {
				this.props.saveSettings(settings);
			}

			render () {
				return (
					<WrappedComponent
						{...this.props}
						settings={this.state.settings}
						originalSettings={this.originalSettings}
						onSettingChange={this.handleFieldChange} />
				);
			}
		}

		SettingsSaver.propTypes = {
			settings: PropTypes.object.isRequired,
			settings_definitions: PropTypes.object.isRequired,
			saveSettings: PropTypes.func
		};

		SettingsSaver.defaultProps = {
			settings: {},
			settings_definitions: {},
			saveSettings: () => { /* no-op */ }
		};

		return hoistNonReactStatics(SettingsSaver, WrappedComponent);
	};

export default withSettingsSaver;
