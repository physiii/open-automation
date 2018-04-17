import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

export class Logout extends Component {
	constructor (props) {
		super(props);

		props.logout();
	}

	render () {
		return <Redirect to="/" />;
	}
};

export default connect(
	null,
	(dispatch) => ({
		logout: () => dispatch(session.operations.logout())
	})
)(Logout);
