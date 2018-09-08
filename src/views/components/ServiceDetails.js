import React from 'react';
import PropTypes from 'prop-types';
import ServiceIcon from '../icons/ServiceIcon.js';
import SettingsField from './SettingsField.js';
import SettingsForm from './SettingsForm.js';
import withSettingsSaver from './withSettingsSaver.js';
import {connect} from 'react-redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';
import './ServiceDetails.css';

export class ServiceDetails extends React.Component {
	render () {
		const service = this.props.service,
			settingsProperties = Object.keys(service.settings_definitions);

		return (
			<React.Fragment>
				{service.error && <p>The device settings could not be updated because of an error.</p>}
				<header styleName="header">
					{ServiceIcon.willRenderIcon(service) &&
					<div styleName="iconContainer">
						<ServiceIcon service={service} size={32} />
					</div>}
					<div styleName="nameContainer">
						<SettingsField
							property="name"
							definition={service.settings_definitions.name}
							value={this.props.settings.name}
							originalValue={this.props.originalSettings.name}
							disabled={!service.state.connected}
							error={this.props.settingsErrors.name}
							onChange={this.props.onSettingChange} />
					</div>
				</header>
				{Boolean(settingsProperties.length - 1) && (
					<React.Fragment>
						<h2 styleName="settingsHeading">{service.strings.friendly_type} Settings</h2>
						<SettingsForm
							fields={settingsProperties.map((property) => {
								if (property === 'name') {
									return null;
								}

								return {
									property,
									definition: service.settings_definitions[property],
									value: this.props.settings[property],
									error: this.props.settingsErrors[property],
									originalValue: this.props.originalSettings[property]
								};
							})}
							disabled={!service.state.connected}
							onFieldChange={this.props.onSettingChange} />
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

ServiceDetails.propTypes = {
	service: PropTypes.object,
	// Props from settings saver HOC.
	settings: PropTypes.object.isRequired,
	settingsErrors: PropTypes.object,
	originalSettings: PropTypes.object.isRequired,
	onSettingChange: PropTypes.func.isRequired
};

const mapStateToProps = ({servicesList}, {serviceId}) => {
		const service = getServiceById(servicesList, serviceId);

		return {
			service,
			// Props for settings saver HOC.
			settings: service.settings,
			settingsDefinitions: service.settings_definitions,
			key: service.error // Re-create component when there's an error to make sure the latest service settings state is rendered.
		};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		// Props for settings saver HOC.
		saveSettings: (settings) => dispatch(setServiceSettings(stateProps.service.id, settings, stateProps.service.settings))
	});

export default connect(mapStateToProps, null, mergeProps)(withSettingsSaver(ServiceDetails));
