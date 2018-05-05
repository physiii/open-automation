import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import '../styles/modules/_Button.scss';

export const Button = (props) => {
	if (props.to) {
		return <Link className="oa-Button" to={props.to}>{props.children}</Link>;
	}

	return (
		<a href="#" onClick={(event) => {
			event.preventDefault();

			if (typeof props.onClick === 'function') {
				props.onClick(event);
			}
		}} className="oa-Button">{props.children}</a>
	);
};

Button.propTypes = {
	to: PropTypes.string,
	onClick: PropTypes.func,
	children: PropTypes.node.isRequired
};

export default Button;
