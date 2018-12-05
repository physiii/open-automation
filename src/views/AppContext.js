import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from './components/PureComponent.js';

const Context = React.createContext(),
	NavigationScreenContext = React.createContext(),
	navigationScreenActions = new Map(),
	navigationScreenBackActions = new Map();

class AppContext extends React.Component {
	constructor (props) {
		super(props);

		this.setScreenActions = this.setScreenActions.bind(this);
		this.clearScreenActions = this.clearScreenActions.bind(this);
		this.setScreenBackActions = this.setScreenBackActions.bind(this);
		this.clearScreenBackActions = this.clearScreenBackActions.bind(this);

		this.contextValue = {
			screenActions: navigationScreenActions,
			setScreenActions: this.setScreenActions,
			clearScreenActions: this.clearScreenActions,
			screenBackActions: navigationScreenBackActions,
			setScreenBackActions: this.setScreenBackActions,
			clearScreenBackActions: this.clearScreenBackActions
		};
	}

	setScreenActions (path, content) {
		navigationScreenActions.set(path, content);
		this.forceUpdate();
	}

	clearScreenActions (path) {
		navigationScreenActions.delete(path);
		this.forceUpdate();
	}

	setScreenBackActions (path, content) {
		navigationScreenBackActions.set(path, content);
		this.forceUpdate();
	}

	clearScreenBackActions (path) {
		navigationScreenBackActions.delete(path);
		this.forceUpdate();
	}

	render () {
		return (
			<Context.Provider value={this.contextValue}>
				<NavigationScreenContext.Provider value={{
					navigationScreenActions: Array.from(navigationScreenActions.values()).pop(),
					navigationScreenBackAction: Array.from(navigationScreenBackActions.values()).pop()
				}}>
					<PureComponent>
						{this.props.children}
					</PureComponent>
				</NavigationScreenContext.Provider>
			</Context.Provider>
		);
	}
}

AppContext.propTypes = {
	children: PropTypes.node
};

export const withAppContext = ({includeScreenActions} = {}) => (Component) => (_props) => (
	<Context.Consumer>
		{(context) => {
			if (includeScreenActions) {
				return (
					<NavigationScreenContext.Consumer>
						{(screenContext) => <Component {...context} {...screenContext} {..._props} />}
					</NavigationScreenContext.Consumer>
				);
			}

			return <Component {...context} {..._props} />;
		}}
	</Context.Consumer>
);

export default AppContext;
