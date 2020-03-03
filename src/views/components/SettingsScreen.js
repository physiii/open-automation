import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import List from './List.js';
import DevicesListScreen from './DevicesListScreen.js';
import RoomsSettingsScreen from './RoomsSettingsScreen.js';
import DoorIcon from '../icons/DoorIcon.js';

export class SettingsScreen extends React.Component {
	render () {
		return (
			<NavigationScreen title="Settings" url={this.props.match.urlWithoutOptionalParams} isContextRoot={true}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<List>
							{[
								{
									label: 'Devices',
									link: this.props.match.url + '/devices',
									icon: <span style={{width: 24}} /> // TODO: Get rid of this hack.
								},
								{
									label: 'Rooms',
									link: this.props.match.url + '/rooms',
									icon: <DoorIcon size={24} />
								}
							]}
						</List>
					)} />
					<DevicesListScreen path={this.props.match.path + '/devices'} />
					<RoomsSettingsScreen path={this.props.match.path + '/rooms'} />
					<Route render={() => <Redirect to={this.props.match.url} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

SettingsScreen.propTypes = {
	match: PropTypes.object.isRequired
};

export default withRoute()(SettingsScreen);
