import React from 'react';
import PropTypes from 'prop-types';
import './Grid.css';

export const GridColumn = (props) => (
	<div styleName={'column' + (props.columns || '')}>
		{props.children}
	</div>
);

GridColumn.propTypes = {
	children: PropTypes.node,
	columns: PropTypes.number
};

export default GridColumn;
