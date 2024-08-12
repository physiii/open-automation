import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Button from './Button.js';
import styles from './ModalShelf.css';

export const ModalShelf = (props) => ReactDOM.createPortal(<React.Fragment>
	<div className={styles.scrim} onClick={props.hide} />
	<div className={styles.modal}>
		<div className={styles.header}>
			<Button onClick={props.hide}>Close</Button>
		</div>
		{props.children}
	</div>
</React.Fragment>, document.body);

ModalShelf.propTypes = {
	children: PropTypes.node,
	hide: PropTypes.func
};

export default ModalShelf;
