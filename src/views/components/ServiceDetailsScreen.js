import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import SettingsField from './SettingsField.js';
import SettingsForm from './SettingsForm.js';
import withSettingsSaver from './withSettingsSaver.js';
import {connect} from 'react-redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';
import './ServiceDetailsScreen.css';

export class ServiceDetailsScreen extends React.Component {
	render () {
		const service = this.props.service;

		if (!service) {
			return <Redirect to={this.props.baseUrl} />;
		}

		return (
			<NavigationScreen path={this.props.match.url} title={this.props.settings.name || service.strings.friendly_type}>
				{service.error && <p>{service.error}</p>}
				<ServiceIcon service={service} size={32} />
				<SettingsField
					property="name"
					label="Feature Name"
					definition={service.settings_definitions.name}
					value={this.props.settings.name}
					originalValue={this.props.originalSettings.name}
					onChange={this.props.onSettingChange} />
				<h2>Settings</h2>
				<SettingsForm
					fields={Object.keys(service.settings_definitions).map((property) => {
						if (property === 'name') {
							return null;
						}

						return {
							property,
							definition: service.settings_definitions[property],
							value: this.props.settings[property],
							originalValue: this.props.originalSettings[property]
						};
					})}
					onFieldChange={this.props.onSettingChange} />
			</NavigationScreen>
		);
	}
}

ServiceDetailsScreen.routeParams = '/:serviceId';

ServiceDetailsScreen.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string,
	// Props from withSettingsSaver.
	settings: PropTypes.object.isRequired,
	originalSettings: PropTypes.object.isRequired,
	onSettingChange: PropTypes.func.isRequired
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId),
			urlParts = match.url.split('/');

		if (!service) {
			// Remove the service ID from the URL.
			urlParts.pop();

			return {baseUrl: urlParts.join('/')};
		}

		return {
			service,
			// Props for settings saver HOC.
			settings: service.settings,
			settings_definitions: service.settings_definitions
		};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		// Props for settings saver HOC.
		saveSettings: (settings) => dispatch(setServiceSettings(stateProps.service.id, settings, stateProps.service.settings))
	});

export default connect(mapStateToProps, null, mergeProps)(withSettingsSaver(ServiceDetailsScreen));
