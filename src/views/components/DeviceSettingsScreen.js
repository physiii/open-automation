import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import Button from './Button.js';
import List from './List.js';
import Form from './Form.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings} from '../../state/ducks/devices-list/operations.js';

export class DeviceSettingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);

		this.settings = {...props.device.settings};
		this.state = {
			formHasErrors: false,
			shouldGoBack: false
		};
	}

	handleSettingsChange (settings) {
		this.settings = {
			...this.settings,
			...settings
		};
	}

	handleSettingsErrors () {
		this.setState({formHasErrors: true});
	}

	handleNoSettingsErrors () {
		this.setState({formHasErrors: false});
	}

	handleSaveClick () {
		this.props.saveSettings(this.settings);
		this.setState({shouldGoBack: true});
	}

	render () {
		if (this.state.shouldGoBack || !this.props.device) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		const device = this.props.device;

		return (
			<NavigationScreen
				title={(device.settings.name || 'Device') + ' Settings'}
				url={this.props.match.url}
				toolbarActions={<Button onClick={this.handleSaveClick} disabled={this.state.formHasErrors || !device.state.connected}>Save</Button>}
				toolbarBackAction={<Button to={this.props.match.parentMatch.url}>Cancel</Button>}>
				<SettingsScreenContainer section={true}>
					{device.error && <p>The device settings could not be updated because of an error.</p>}
					{!device.state.connected && (
						<List>
							{[
								{
									label: 'Device is not responding',
									secondaryText: 'Device must be reachable to update settings.'
								}
							]}
						</List>
					)}
					<Form
						fields={device.settings_definitions}
						values={device.settings}
						disabled={!device.state.connected}
						onSaveableChange={this.handleSettingsChange}
						onError={this.handleSettingsErrors}
						onNoError={this.handleNoSettingsErrors}
						key={device.error} /> {/* Re-create component when there's an error to make sure the latest device settings state is rendered. */}
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

DeviceSettingsScreen.propTypes = {
	device: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowRoomField: PropTypes.bool,
	match: PropTypes.object,
	saveSettings: PropTypes.func.isRequired
};

const mapStateToProps = ({devicesList}, {device: ownPropsDevice, match}) => {
		if (ownPropsDevice) {
			return {device: ownPropsDevice};
		}

		const device = getDeviceById(devicesList, match.params.deviceId);

		if (!device) {
			return {};
		}

		return {device};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		saveSettings: (settings) => dispatch(setDeviceSettings(stateProps.device.id, settings, stateProps.device.settings))
	});

export default compose(
	withRoute({params: '/:deviceId?'}),
	connect(mapStateToProps, null, mergeProps, {pure: false})
)(DeviceSettingsScreen);
