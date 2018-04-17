import React from 'react';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js'
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';
import '../styles/modules/_AppToolbar.scss';

export const AppToolbar = (props) => {
	return (
		<div className="oa-AppToolbar">
			<Toolbar
				leftChildren={<Button to="/">Pyfi</Button>}
				rightChildren={[
					<button key="register">Register</button>,
					props.isLoggedIn ?
						<Button to="/logout" key="logout">Logout</Button> :
						<Button to="/login" key="login">Login</Button>
				]}
			/>
		</div>
	);
};

const mapStateToProps = (state) => ({
	isLoggedIn: session.selectors.isAuthenticated(state.session)
});

export default connect(mapStateToProps)(AppToolbar);
