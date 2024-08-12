import React from 'react';
import PropTypes from 'prop-types';
import styles from './Toolbar.css';

const Toolbar = (props) => (
	<div className={styles.toolbar}>
		<div className={styles.left}>{props.leftChildren}</div>
		{props.middleChildren &&
			<div className={styles.middle}>{props.middleChildren}</div>}
		{(props.rightChildren || props.middleChildren) &&
			<div className={styles.right}>{props.rightChildren}</div>}
	</div>
);

Toolbar.propTypes = {
	leftChildren: PropTypes.node,
	middleChildren: PropTypes.node,
	rightChildren: PropTypes.node
};

export default Toolbar;
