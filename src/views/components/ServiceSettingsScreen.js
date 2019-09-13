import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import Button from './Button.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import Form from './Form.js';
import DeviceRoomField from './DeviceRoomField.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';
import './ServiceSettingsScreen.css';

export class ServiceSettingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);

		this.state = {
			formsWithErrorsCount: 0,
			shouldGoBack: false
		};

		if (!props.service) {
			return;
		}

		this.settings = {...props.service.settings.toObject()};
	}

	handleSettingsChange (settings) {
		this.settings = {
			...this.settings,
			...settings
		};
	}

	handleSettingsErrors () {
		this.setState((state) => ({formsWithErrorsCount: state.formsWithErrorsCount + 1}));
	}

	handleNoSettingsErrors () {
		this.setState((state) => ({formsWithErrorsCount: state.formsWithErrorsCount - 1}));
	}

	handleSaveClick () {
		this.props.saveSettings(this.settings);
		this.setState({shouldGoBack: true});
	}

	render () {
		if (this.state.shouldGoBack || !this.props.service) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		const service = this.props.service,
			{name: nameField, show_on_dashboard: dashboardField, ...restOfSettingsFields} = {...service.settings_definitions.toObject()};

		return (
			<NavigationScreen
				title={(service.settings.get('name') || service.strings.get('friendly_type')) + ' Settings'}
				url={this.props.match.url}
				toolbarActions={<Button onClick={this.handleSaveClick} disabled={this.state.formsWithErrorsCount > 0 || !service.state.get('connected')}>Save</Button>}
				toolbarBackAction={<Button to={this.props.match.parentMatch.url}>Cancel</Button>}>
				<SettingsScreenContainer section={true}>
					{service.error && <p>The device settings could not be updated because of an error.</p>}
					{!service.state.get('connected') && (
						<List>
							{[
								{
									label: 'Device is not responding',
									secondaryText: 'Device must be reachable to update settings.'
								}
							]}
						</List>
					)}
					<header styleName="header">
						{ServiceIcon.willRenderIcon(service) &&
							<div styleName="iconContainer">
								<ServiceIcon service={service} size={32} />
							</div>}
						<div styleName="nameContainer">
							<Form
								fields={{name: nameField}}
								values={{name: service.settings.get('name')}}
								disabled={!service.state.get('connected')}
								onSaveableChange={this.handleSettingsChange}
								onError={this.handleSettingsErrors}
								onNoError={this.handleNoSettingsErrors}
								key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
						</div>
					</header>
					{this.props.shouldShowRoomField && <DeviceRoomField deviceId={service.device_id} />}
					<Form
						fields={{show_on_dashboard: dashboardField}}
						values={{show_on_dashboard: service.settings.get('show_on_dashboard')}}
						disabled={!service.state.get('connected')}
						onSaveableChange={this.handleSettingsChange}
						onError={this.handleSettingsErrors}
						onNoError={this.handleNoSettingsErrors}
						key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
					{this.props.children}
					{Form.willAnyFieldsRender(restOfSettingsFields) && (
						<React.Fragment>
							<h1 styleName="settingsHeading">{service.strings.get('friendly_type')} Settings</h1>
							<Form
								fields={restOfSettingsFields}
								values={service.settings.toObject()}
								disabled={!service.state.get('connected')}
								onSaveableChange={this.handleSettingsChange}
								onError={this.handleSettingsErrors}
								onNoError={this.handleNoSettingsErrors}
								key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
						</React.Fragment>
					)}
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

ServiceSettingsScreen.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowRoomField: PropTypes.bool,
	match: PropTypes.object,
	saveSettings: PropTypes.func.isRequired
};

const mapStateToProps = ({servicesList}, {service: ownPropsService, match}) => {
		if (ownPropsService) {
			return {service: ownPropsService};
		}

		const service = getServiceById(servicesList, match.params.serviceId, false);

		if (!service) {
			return {};
		}

		return {service};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		saveSettings: (settings) => dispatch(setServiceSettings(stateProps.service.id, settings, stateProps.service.settings.toObject()))
	});

export default compose(
	withRoute({params: '/:serviceId?'}),
	connect(mapStateToProps, null, mergeProps, {pure: false})
)(ServiceSettingsScreen);
