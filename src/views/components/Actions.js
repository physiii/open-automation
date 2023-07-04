import React from 'react';
import PropTypes from 'prop-types';
import styles from './Actions.css';

export const Actions = (props) => {
	return (
		<div className={styles.actions}>
			{props.children}
		</div>
	);
};

Actions.propTypes = {
	children: PropTypes.node
};

export default Actions;
