import React from 'react';
import PropTypes from 'prop-types';
import './Grid.css';

export const Grid = (props) => (
	<div styleName="grid">
		{props.children}
	</div>
);

Grid.propTypes = {
	children: PropTypes.node
};

export default Grid;
