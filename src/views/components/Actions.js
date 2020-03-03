import React from 'react';
import PropTypes from 'prop-types';
import './Actions.css';

export const Actions = (props) => {
	return (
		<div styleName="actions">
			{props.children}
		</div>
	);
};

Actions.propTypes = {
	children: PropTypes.node
};

export default Actions;
