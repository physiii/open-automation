import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import List from './List.js';
import DevicesListScreen from './DevicesListScreen.js';

export class SettingsScreen extends React.Component {
	render () {
		return (
			<NavigationScreen isContextRoot={true} path={this.props.match.url} title="Settings" shouldShowTitle={false}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<List items={[
							{
								label: 'Devices',
								link: this.props.match.url + '/devices'
							}
						]} />
					)} />
					<Route path={this.props.match.path + '/devices'} render={(routeProps) => <DevicesListScreen {...routeProps} />} />
					<Route render={() => <Redirect to={this.props.match.path} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

SettingsScreen.propTypes = {
	match: PropTypes.object.isRequired
};

export default SettingsScreen;
