import React from 'react';
import PropTypes from 'prop-types';
import styles from './Grid.css';

export const Grid = (props) => (
	<div className={styles.grid}>
		{props.children}
	</div>
);

Grid.propTypes = {
	children: PropTypes.node
};

export default Grid;
