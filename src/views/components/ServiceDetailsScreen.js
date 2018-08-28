import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import TextField from './TextField.js';
import {connect} from 'react-redux';
import {debounce} from 'debounce';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';

const FIELD_DEBOUNCE_DELAY = 500;

export class ServiceDetailsScreen extends React.Component {
	constructor (props) {
		super(props);

		if (!props.service) {
			return;
		}

		this.originalSettings = props.service.settings;

		this.state = {
			settings: {...props.service.settings}
		};

		this.handleFieldChange = this.handleFieldChange.bind(this);
		this.setSettings = debounce(this.setSettings, FIELD_DEBOUNCE_DELAY);
	}

	handleFieldChange (event, field) {
		const settingsDefinitions = this.props.service.settings_definitions[field],
			fieldIsNumber = settingsDefinitions.type === 'integer' || settingsDefinitions.type === 'number',
			settings = {
				...this.state.settings,
				[field]: fieldIsNumber ? Number(event.target.value) : event.target.value
			};

		let shouldSaveSettings = event.type === 'change';

		// If name is empty, reset to the original name.
		if (field === 'name' && !settings.name) {
			if (event.type === 'blur') {
				settings.name = this.originalSettings.name;
				shouldSaveSettings = settings.name !== this.props.service.settings.name;
			} else if (event.type === 'change') {
				shouldSaveSettings = false;
			}
		}

		this.setState({settings});

		if (shouldSaveSettings) {
			this.setSettings(settings);
		}
	}

	setSettings (settings) {
		this.props.setSettings(settings);
	}

	render () {
		const service = this.props.service;

		if (!service) {
			return <Redirect to={this.props.baseUrl} />;
		}

		const serviceName = service.settings.name || service.strings.friendly_type;

		return (
			<NavigationScreen path={this.props.match.url} title={serviceName}>
				<ServiceIcon service={service} size={32} />
				{service.error && <p>{service.error}</p>}
				<TextField
					name="name"
					label="Feature Name"
					value={this.state.settings.name}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldChange} />
				{Object.keys(service.settings_definitions).map((property) => {
					const definition = service.settings_definitions[property];

					if (definition.type !== 'integer') {
						return null;
					}

					return (
						<TextField
							name={property}
							label={definition.label}
							value={this.state.settings[property]}
							onChange={this.handleFieldChange}
							onBlur={this.handleFieldChange}
							key={property} />
					);
				})}
			</NavigationScreen>
		);
	}
}

ServiceDetailsScreen.routeParams = '/:serviceId';

ServiceDetailsScreen.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string,
	setSettings: PropTypes.func.isRequired
};

const mapStateToProps = (state, {match}) => {
		const service = getServiceById(match.params.serviceId, state.servicesList),
			urlParts = match.url.split('/');

		if (!service) {
			// Remove the service ID from the URL.
			urlParts.pop();

			return {baseUrl: urlParts.join('/')};
		}

		return {service};
	},
	mapDispatchToProps = (dispatch) => ({dispatch}),
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		setSettings: (settings) => dispatch(setServiceSettings(stateProps.service.id, settings, stateProps.service.settings))
	});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ServiceDetailsScreen);
