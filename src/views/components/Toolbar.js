import React from 'react';
import PropTypes from 'prop-types';
import './Toolbar.css';

const Toolbar = (props) => (
	<div styleName="toolbar">
		<div styleName="left">{props.leftChildren}</div>
		{props.middleChildren &&
			<div styleName="middle">{props.middleChildren}</div>}
		{(props.rightChildren || props.middleChildren) &&
			<div styleName="right">{props.rightChildren}</div>}
	</div>
);

Toolbar.propTypes = {
	leftChildren: PropTypes.node,
	middleChildren: PropTypes.node,
	rightChildren: PropTypes.node
};

export default Toolbar;
