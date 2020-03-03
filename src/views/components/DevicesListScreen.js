import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import DevicesList from './DevicesList.js';
import DeviceDetailsScreen from './DeviceDetailsScreen.js';
import Button from './Button.js';
import AddIcon from '../icons/AddIcon.js';
import DeviceAddScreen from './DeviceAddScreen.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class DevicesListScreen extends React.Component {
	render () {
		return (
			<NavigationScreen
				title="Devices"
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={
					<React.Fragment>
						<Button to={this.props.match.url + '/add'}><AddIcon size={20} /></Button>
					</React.Fragment>}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => <DevicesList deviceLinkBase={this.props.match.url} />} />
					<DeviceAddScreen path={this.props.match.path + '/add'} isNew={true} />
					<DeviceDetailsScreen path={this.props.match.path} />
					<Route render={() => <Redirect to={this.props.match.url} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

DevicesListScreen.propTypes = {
	devices: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList}) => ({
	devices: getDevices(devicesList).map((device) => ({
		...device,
		services: device.services.map(({id}) => getServiceById(servicesList, id, false))
	}))
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(DevicesListScreen);
