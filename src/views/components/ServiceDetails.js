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

	render () {
		const service = this.props.service,
			{name: nameField, ...restOfSettingsFields} = {...service.settings_definitions.toObject()};

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
							values={{name: service.settings.get('name')}}
							disabled={!service.state.get('connected')}
							onSaveableChange={this.handleSettingsChange}
							key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
					</div>
				</header>
				{this.props.shouldShowRoomField && <DeviceRoomField deviceId={service.device_id} />}
				{this.props.children}
				{SettingsForm.willAnyFieldsRender(restOfSettingsFields) && (
					<React.Fragment>
						<h1 styleName="settingsHeading">{service.strings.get('friendly_type')} Settings</h1>
						<SettingsForm
							fields={restOfSettingsFields}
							values={service.settings.toObject()}
							disabled={!service.state.get('connected')}
							onSaveableChange={this.handleSettingsChange}
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
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings.toObject()))
});

export default connect(null, null, mergeProps)(ServiceDetails);
