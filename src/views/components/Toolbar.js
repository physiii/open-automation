import React from 'react';
import PropTypes from 'prop-types';
import '../styles/modules/_Toolbar.scss';

const Toolbar = (props) => (
	<div className="oa-Toolbar">
		<div className="oa-Toolbar--left">{props.leftChildren}</div>
		{props.middleChildren ? <div className="oa-Toolbar--middle">{props.middleChildren}</div> : null}
		{props.rightChildren ? <div className="oa-Toolbar--right">{props.rightChildren}</div> : null}
	</div>
);

Toolbar.propTypes = {
	leftChildren: PropTypes.node,
	middleChildren: PropTypes.node,
	rightChildren: PropTypes.node
};

export default Toolbar;
