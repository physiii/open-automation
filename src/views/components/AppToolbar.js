import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import {connect} from 'react-redux';
import {isAuthenticated} from '../../state/ducks/session/selectors.js';
import '../styles/modules/_AppToolbar.scss';

export const AppToolbar = (props) => (
	<div className="oa-AppToolbar">
		<Toolbar
			leftChildren={<Button to="/">Pyfi</Button>}
			rightChildren={[
				<button key="register">Register</button>,
				props.isLoggedIn
					? <Button to="/logout" key="logout">Logout</Button>
					: <Button to="/login" key="login">Login</Button>
			]}
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
