import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import {getAppName, getLogoPath} from '../../state/ducks/config/selectors.js';
import {getCurrentScreenTitle, shouldShowCurrentScreenTitle, getCurrentScreenPath, getPreviousScreenPath, getPreviousScreenTitle} from '../../state/ducks/navigation/selectors.js';
import {getUsername} from '../../state/ducks/session/selectors.js';
import './AppToolbar.css';

const Context = React.createContext(),
	screenActions = {};

export const AppToolbar = (props) => {
	let left;

	if (props.backPath) {
		left = (
			<Button to={props.backPath}>
				&lt;
				{props.backLabel && ' ' + props.backLabel}
			</Button>
		);
	} else if (props.logoPath) {
		left = (
			<div styleName="logo">
				<img src={props.logoPath} />
			</div>
		);
	} else {
		left = <h1>{props.appName}</h1>;
	}

	return (
		<div styleName="toolbar">
			<Toolbar
				leftChildren={left}
				middleChildren={props.title && props.shouldShowTitle && <h1>{props.title}</h1>}
				rightChildren={screenActions[props.path] || (!props.shouldShowTitle &&
					<React.Fragment>
						<span>{props.username}</span>
						<Button to="/logout">Logout</Button>
					</React.Fragment>
				)}
			/>
		</div>
	);
};

AppToolbar.propTypes = {
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	title: PropTypes.string,
	shouldShowTitle: PropTypes.bool,
	path: PropTypes.string,
	backPath: PropTypes.string,
	backLabel: PropTypes.string,
	username: PropTypes.string
};

export const AppToolbarContextProvider = (_props) => (
	<Context.Provider value={{
		setScreenActionsForPath: (path, content) => {
			screenActions[path] = content;
		}
	}}>
		{_props.children}
	</Context.Provider>
);

export const withSetScreenActions = (Component) => (_props) => (
	<Context.Consumer>
		{(context) => <Component setScreenActions={context ? context.setScreenActionsForPath : () => { /* no-op */ }} {..._props} />}
	</Context.Consumer>
);

const mapStateToProps = (state) => {
	return {
		appName: getAppName(state.config),
		logoPath: getLogoPath(state.config),
		title: getCurrentScreenTitle(state.navigation),
		shouldShowTitle: shouldShowCurrentScreenTitle(state.navigation),
		path: getCurrentScreenPath(state.navigation),
		backPath: getPreviousScreenPath(state.navigation),
		backLabel: getPreviousScreenTitle(state.navigation),
		username: getUsername(state.session)
	};
};

export default connect(mapStateToProps)(AppToolbar);
