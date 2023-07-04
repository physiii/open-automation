import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import {Route} from './Route.js';
import Button from './Button.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import styles from './ServiceDetails.css';
import MetaList from './MetaList.js';

export class ServiceDetails extends React.Component {
	getDevice (property) {
		return (
			this.props.service.state.get('device' + property) ? this.props.service.state.get('device' + property) : '...'
		);
	}

	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<SettingsScreenContainer section={true}>
						{this.props.service.error && <p>The device settings could not be updated because of an error.</p>}
						<header className={styles.header}>
							{this.props.shouldShowSettingsButton && <Button to={this.props.match.url + ServiceDetails.settingsPath}>Settings</Button>}
						</header>
						{this.props.children}
						<MetaList layout="vertical" alignLabels="left">
							{[
								{label: 'Hardware', value: this.getDevice('HardwareVersion')},
								{label: 'Temperature', value: this.getDevice('Temp')},
								{label: 'Frequency', value: this.getDevice('Freq')},
								{label: 'Up Time', value: this.getDevice('UpTime')}
							].filter((item) => Boolean(item.value))}
						</MetaList>
					</SettingsScreenContainer>
				)} />
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + ServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

ServiceDetails.settingsPath = '/service-settings';

ServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	match: PropTypes.object
};

export default withRouter(ServiceDetails);
