import React from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext(),
	navigationScreenActions = new Map(),
	navigationScreenBackActions = new Map();

class AppContext extends React.Component {
	constructor (props) {
		super(props);

		this.setScreenActions = this.setScreenActions.bind(this);
		this.getScreenActions = this.getScreenActions.bind(this);
		this.setScreenBackActions = this.setScreenBackActions.bind(this);
		this.getScreenBackActions = this.getScreenBackActions.bind(this);
	}

	setScreenActions (path, content) {
		if (content) {
			navigationScreenActions.set(path, content);
		} else {
			navigationScreenActions.delete(path);
		}
	}

	getScreenActions (path) {
		return path
			? navigationScreenActions.get(path)
			: navigationScreenActions;
	}

	setScreenBackActions (path, content) {
		if (content) {
			navigationScreenBackActions.set(path, content);
		} else {
			navigationScreenBackActions.delete(path);
		}
	}

	getScreenBackActions (path) {
		return path
			? navigationScreenBackActions.get(path)
			: navigationScreenBackActions;
	}

	render () {
		return (
			<Context.Provider value={{
				setScreenActions: this.setScreenActions,
				getScreenActions: this.getScreenActions,
				setScreenBackActions: this.setScreenBackActions,
				getScreenBackActions: this.getScreenBackActions
			}}>
				{this.props.children}
			</Context.Provider>
		);
	}
}

AppContext.propTypes = {
	children: PropTypes.node
};

export const withAppContext = (Component) => (_props) => (
	<Context.Consumer>
		{(context) => <Component {...context} {..._props} />}
	</Context.Consumer>
);

export default AppContext;
