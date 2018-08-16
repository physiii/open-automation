import React from 'react';
import PropTypes from 'prop-types';
import iconBase from './iconBase.js';
import './ExpandIcon.css';

export const ExpandIcon = ({className, isExpanded, isHovered, ...props}) => (
	<svg
		className={className}
		styleName={(isHovered ? 'isHovered' : '') + (isExpanded ? ' isExpanded' : '')}
		viewBox="0 0 22 22"
		xmlns="http://www.w3.org/2000/svg"
		{...props}>
		<g fillRule="evenodd">
			<path styleName="topArrow" d="M10.2,10.2L16.5,4L12,4l0-2h7c0.5,0,1,0.5,1,1v7h-2V5.5l-6.2,6.2L10.2,10.2z" />
			<path styleName="bottomArrow" d="M11.8,11.8L5.5,18l4.5,0l0,2H3c-0.5,0-1-0.5-1-1v-7h2v4.5l6.2-6.2L11.8,11.8z" />
		</g>
	</svg>
);

ExpandIcon.propTypes = {
	className: PropTypes.string,
	isExpanded: PropTypes.bool,
	isHovered: PropTypes.bool
};

export default iconBase(ExpandIcon, true);
