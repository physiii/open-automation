import React from 'react';
import PropTypes from 'prop-types';
import styles from './GridColumn.css';

export const GridColumn = (props) => {
	const numberOfColumns = props.columns || '',
		columnClass = numberOfColumns ? styles[`column${numberOfColumns}`] : '',
		combinedClasses = `${styles.column} ${columnClass}`;

	return (
		<div className={combinedClasses}>
			{props.children}
		</div>
	);
};

GridColumn.propTypes = {
	children: PropTypes.node,
	columns: PropTypes.number
};

export default GridColumn;
