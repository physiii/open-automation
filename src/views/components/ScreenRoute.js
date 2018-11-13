import React from 'react';
import PropTypes from 'prop-types';
import NavigationScreen from './NavigationScreen.js';
import {Route, matchPath} from 'react-router-dom';

export class ScreenRoute extends React.Component {
	constructor (props) {
		super(props);

		this.setTitle = this.setTitle.bind(this);
		this.setToolbarActions = this.setToolbarActions.bind(this);

		this.state = {
			title: null,
			actions: null
		};
	}

	setTitle (title) {
		this.setState({title});
	}

	setToolbarActions (actions) {
		this.setState({actions});
	}

	// Gets the matched URL and removes any optional segments at the end.
	getNavigationUrl (url) {
		const pattern = new RegExp(/(\/:[^/?]+[?*])*$/, this.props.sensitive ? '' : 'i'), // Match all optional parameters at the end of the path.
			modifiedPath = this.props.path.replace(pattern, ''),
			modifiedMatch = matchPath(url, {...this.props, path: modifiedPath});

		return modifiedMatch ? modifiedMatch.url : url;
	}

	render () {
		const {title, isContextRoot, component: Component, render, ...routeProps} = this.props;

		// This component doesn't support rendering with the children prop.
		delete routeProps.children;

		return (
			<Route {...routeProps} key={this.props.path} render={({match}) => {
				return (
					<NavigationScreen
						path={this.getNavigationUrl(match.url)}
						title={this.state.title || title}
						toolbarActions={this.state.actions}
						isContextRoot={isContextRoot}>
						<Route {...routeProps} render={(_routeProps) => {
							const contentProps = {
								..._routeProps,
								setScreenTitle: this.setTitle,
								setToolbarActions: this.setToolbarActions
							};

							if (Component) {
								return <Component {...contentProps} />;
							} else if (typeof render === 'function') {
								return render(contentProps);
							}
						}} />
					</NavigationScreen>
				);
			}} />
		);
	}
}

ScreenRoute.propTypes = {
	...Route.propTypes,
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	isContextRoot: PropTypes.bool
};

export default ScreenRoute;
