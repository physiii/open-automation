import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ServiceIcon from '../icons/ServiceIcon.js';
import SettingsForm from './SettingsForm.js';
import DeviceRoomField from './DeviceRoomField.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';
import './ServiceDetails.css';

export class ServiceDetails extends React.Component {
	constructor (props) {
		super(props);

		this.handleSettingsChange = this.handleSettingsChange.bind(this);

		this.settings = {...props.service.settings};
	}

	handleSettingsChange (settings) {
		this.settings = {
			...this.settings,
			...settings
		};

		this.props.saveSettings(this.settings);
	}

	handleInput (value) {
		this.settings.sensitivity = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	handleChange (value) {
		this.settings.sensitivity = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	render () {
		const service = this.props.service,
			{name: nameField, show_on_dashboard: dashboardField, ...restOfSettingsFields} = {...service.settings_definitions};

		return (
			<section styleName="container">
				{service.error && <p>The device settings could not be updated because of an error.</p>}
				<header styleName="header">
					{ServiceIcon.willRenderIcon(service) &&
					<div styleName="iconContainer">
						<ServiceIcon service={service} size={32} />
					</div>}
					<div styleName="nameContainer">
						<SettingsForm
							fields={{name: nameField}}
							values={{name: service.settings.name}}
							disabled={!service.state.connected}
							onSaveableChange={this.handleSettingsChange}
							key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
					</div>
				</header>
				{this.props.shouldShowRoomField && <DeviceRoomField deviceId={service.device_id} />}
				<SettingsForm
					fields={{show_on_dashboard: dashboardField}}
					values={{show_on_dashboard: service.settings.show_on_dashboard}}
					disabled={!service.state.connected}
					onSaveableChange={this.handleSettingsChange}
					key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
				{this.props.children}
				{SettingsForm.willAnyFieldsRender(restOfSettingsFields) && (
					<React.Fragment>
						<h1 styleName="settingsHeading">{service.strings.friendly_type} Settings</h1>
						<SettingsForm
							fields={restOfSettingsFields}
							values={service.settings}
							disabled={!service.state.connected}
							onSaveableChange={this.handleSettingsChange}
							onInput={this.handleInput.bind(this)}
							onChange={this.handleChange.bind(this)}
							key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
					</React.Fragment>
				)}
			</section>
		);
	}
}

ServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowRoomField: PropTypes.bool,
	saveSettings: PropTypes.func.isRequired
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings))
});

export default connect(null, null, mergeProps)(ServiceDetails);
