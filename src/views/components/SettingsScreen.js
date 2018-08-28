import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationContext from './NavigationContext.js';
import List from './List.js';
import DevicesListScreen from './DevicesListScreen.js';

export class SettingsScreen extends React.Component {
	render () {
		return (
			<NavigationContext path={this.props.match.url} title="Settings" shouldShowTitle={false}>
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
			</NavigationContext>
		);
	}
}

SettingsScreen.propTypes = {
	match: PropTypes.object.isRequired
};

export default SettingsScreen;
