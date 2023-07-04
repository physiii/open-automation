import React from 'react';
import PropTypes from 'prop-types';
import styles from './BlankState.css';

export const BlankState = (props) => (
	<section className={styles.blankState}>
		<h1 className={styles.heading}>{props.heading}</h1>
		<p className={styles.body}>{props.body}</p>
	</section>
);

BlankState.propTypes = {
	heading: PropTypes.string,
	body: PropTypes.string
};

export default BlankState;
