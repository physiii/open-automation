import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import '../styles/modules/_AppToolbar.scss';

export const AppToolbar = (props) => (
	<div className="oa-AppToolbar">
		<Toolbar
			leftChildren={<Button to="/">Open Automation</Button>}
			rightChildren={[
				<span key="username">{props.username}</span>,
				<Button to="/logout" key="logout-button">Logout</Button>
			]}
		/>
	</div>
);

AppToolbar.propTypes = {
	username: PropTypes.string
};

const mapStateToProps = (state) => ({
	username: state.session.user && state.session.user.username
});

export default connect(mapStateToProps)(AppToolbar);
