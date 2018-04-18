import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

export const Button = (props) => (
	<Link to={props.to}>{props.children}</Link>
);

Button.propTypes = {
	to: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};

export default Button;
