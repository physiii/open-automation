import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';
import './ExpandIcon.css';

export const ExpandIcon = (props) => (
	<IconBase {...props}>
		<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
			<g fillRule="evenodd">
				<path styleName="topArrow" d="M9.75 9.75L3.5 15.9984016l4.4529203.0079445L8 18H1c-.5 0-1-.5-1-1v-7h2v4.5l6.25-6.25 1.5 1.5z" />
				<path styleName="bottomArrow" d="M8.25 8.25l6.25-6.24840162-4.4529203-.00794446L10 0h7c.5 0 1 .5 1 1v7h-2V3.5L9.75 9.75l-1.5-1.5z" />
			</g>
		</svg>
	</IconBase>
);

ExpandIcon.propTypes = {
	shadowed: PropTypes.bool
};

export default ExpandIcon;
