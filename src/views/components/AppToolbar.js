import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import '../styles/modules/_AppToolbar.scss';

const SECOND_TO_LAST = -2;

export const AppToolbar = (props) => {
	const screenInfo = props.screenHistory && props.screenHistory.last(),
		previousScreenInfo = props.screenHistory && props.screenHistory.toList().get(SECOND_TO_LAST),
		title = screenInfo && screenInfo.get('title');

	let left;

	if (screenInfo) {
		left = (
			<Button to={screenInfo.get('backPath')}>
				&lt;
				{previousScreenInfo
					? previousScreenInfo.get('title')
					: null}
			</Button>
		);
	} else {
		left = <label>{props.appName}</label>;
	}

	return (
		<div className="oa-AppToolbar">
			<Toolbar
				leftChildren={left}
				middleChildren={title}
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
	username: PropTypes.string,
	screenHistory: PropTypes.object
};

const mapStateToProps = (state) => ({
	appName: state.config.app_name,
	username: state.session.user && state.session.user.username,
	screenHistory: state.navigation.screenHistory.get(state.navigation.currentContext)
});

export default connect(mapStateToProps)(AppToolbar);
