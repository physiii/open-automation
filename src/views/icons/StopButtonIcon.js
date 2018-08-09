import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';
import './StopButtonIcon.css';

export const StopButtonIcon = (props) => (
	<IconBase {...props}>
		<svg
			styleName={props.shadowed ? 'shadowedFill' : ''}
			viewBox="0 0 68 68"
			xmlns="http://www.w3.org/2000/svg">
			<defs>
				<path id="StopButtonIcon-main" d="M280 182c-17.673112 0-32-14.326888-32-32s14.326888-32 32-32 32 14.326888 32 32-14.326888 32-32 32zm-10-42v20h20v-20h-20z" />
				<filter
					id="StopButtonIcon-shadowedFilter"
					x="-6.2%"
					y="-3.1%"
					width="112.5%"
					height="112.5%"
					filterUnits="objectBoundingBox">
					<feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
					<feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
					<feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
					<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" in="shadowBlurOuter1" />
				</filter>
			</defs>
			<g transform="translate(-246 -118)" fillRule="evenodd">
				{props.shadowed &&
					<use fill="#000" filter="url(#StopButtonIcon-shadowedFilter)" xlinkHref="#StopButtonIcon-main" />}
				<use xlinkHref="#StopButtonIcon-main"/>
			</g>
		</svg>
	</IconBase>
);

StopButtonIcon.propTypes = {
	shadowed: PropTypes.bool
};

export default StopButtonIcon;
