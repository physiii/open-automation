import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import './AppToolbar.css';

export const AppToolbar = (props) => {
	let left;

	if (props.backPath) {
		left = (
			<Button to={props.backPath}>
				&lt;
				{props.backLabel}
			</Button>
		);
	} else if (props.logoPath) {
		left = (<div styleName="logo">
			<img src={'/' + props.logoPath} />
		</div>);
	} else {
		left = <label>{props.appName}</label>;
	}

	return (
		<div styleName="toolbar">
			<Toolbar
				leftChildren={left}
				middleChildren={props.title}
				rightChildren={[
					<span key="username">{props.username}</span>,
					<Button to="/logout" key="logout-button">Logout</Button>
				]}
			/>
		</div>
	);
};

AppToolbar.propTypes = {
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	title: PropTypes.string,
	backPath: PropTypes.string,
	backLabel: PropTypes.string,
	username: PropTypes.string
};

const mapStateToProps = (state) => {
	const SECOND_TO_LAST = -2,
		screenHistory = state.navigation.screenHistory.get(state.navigation.currentContext),
		screenInfo = screenHistory && screenHistory.last(),
		previousScreenInfo = screenHistory && screenHistory.toList().get(SECOND_TO_LAST);

	return {
		appName: state.config.app_name,
		logoPath: state.config.logo_path,
		title: screenInfo && screenInfo.get('title'),
		backPath: screenInfo && screenInfo.get('backPath'),
		backLabel: previousScreenInfo && previousScreenInfo.get('title'),
		username: state.session.user && state.session.user.username
	};
};

export default connect(mapStateToProps)(AppToolbar);
