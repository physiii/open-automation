import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Button from './Button.js';
import './ModalShelf.css';

export const ModalShelf = (props) => ReactDOM.createPortal(<React.Fragment>
	<div styleName="scrim" onClick={props.hide} />
	<div styleName="modal">
		<div styleName="header">
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
