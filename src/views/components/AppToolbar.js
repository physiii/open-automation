import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import {isAuthenticated} from '../../state/ducks/session/selectors.js';
import '../styles/modules/_AppToolbar.scss';

export const AppToolbar = () => (
	<div className="oa-AppToolbar">
		<Toolbar
			leftChildren={<Button to="/">Open Automation</Button>}
			rightChildren={<Button to="/logout" key="logout">Logout</Button>}
		/>
	</div>
);

AppToolbar.propTypes = {
	isLoggedIn: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isLoggedIn: isAuthenticated(state.session)
});

export default connect(mapStateToProps)(AppToolbar);
