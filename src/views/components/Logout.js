import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

export class Logout extends React.Component {
	constructor (props) {
		super(props);
		props.logout();
	}

	render () {
		return <Redirect to="/" />;
	}
}

Logout.propTypes = {
	logout: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
	logout: () => dispatch(session.operations.logout())
});

export default connect(null, mapDispatchToProps)(Logout);
