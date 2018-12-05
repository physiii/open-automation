import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {withAppContext} from '../AppContext.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getAppName, getLogoPath} from '../../state/ducks/config/selectors.js';
import {getCurrentScreenTitle, shouldShowCurrentScreenTitle, getPreviousScreenPath, getPreviousScreenTitle} from '../../state/ducks/navigation/selectors.js';
import {getUsername} from '../../state/ducks/session/selectors.js';
import './AppToolbar.css';

export const AppToolbar = (props) => {
	let backProps,
		left;

	if (typeof props.backAction === 'function') {
		backProps = {onClick: props.backAction};
	} else if (typeof props.backAction === 'string') {
		backProps = {to: props.backAction};
	}

	if (backProps) {
		left = (
			<Button {...backProps}>
				&lt;
				{props.backLabel && ' ' + props.backLabel}
			</Button>
		);
	} else if (props.backAction) {
		left = props.backAction;
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
				rightChildren={props.screenActions || (!props.shouldShowTitle &&
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
	backPath: PropTypes.string,
	backLabel: PropTypes.string,
	backAction: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
	screenActions: PropTypes.node,
	username: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
	return {
		appName: getAppName(state.config),
		logoPath: getLogoPath(state.config),
		title: getCurrentScreenTitle(state.navigation),
		shouldShowTitle: shouldShowCurrentScreenTitle(state.navigation),
		screenActions: ownProps.navigationScreenActions,
		backAction: ownProps.navigationScreenBackAction || getPreviousScreenPath(state.navigation),
		backLabel: getPreviousScreenTitle(state.navigation),
		username: getUsername(state.session)
	};
};

export default compose(
	withAppContext({includeScreenActions: true}),
	connect(mapStateToProps)
)(AppToolbar);
