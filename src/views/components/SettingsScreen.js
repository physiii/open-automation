import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import ScreenRoute from './ScreenRoute.js';
import List from './List.js';
import DevicesListScreen from './DevicesListScreen.js';

export class SettingsScreen extends React.Component {
	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.path} render={() => (
					<List>
						{[
							{
								label: 'Devices',
								link: this.props.match.url + '/devices'
							}
						]}
					</List>
				)} />
				<ScreenRoute path={this.props.match.path + '/devices'} title="Devices" component={DevicesListScreen} />
				<Route render={() => <Redirect to={this.props.match.path} />} />
			</Switch>
		);
	}
}

SettingsScreen.propTypes = {
	match: PropTypes.object.isRequired
};

export default SettingsScreen;
