import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';
import './PlayButtonIcon.css';

export const PlayButtonIcon = (props) => (
	<IconBase>
		<svg styleName={props.shadowed ? 'shadowedFill' : ''} width="68" height="68" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<path d="M200 182c-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32 17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32zm12.998-32L193 136l-.002 28 20-14z" id="b"/>
				<filter
					x="-6.2%"
					y="-3.1%"
					width="112.5%"
					height="112.5%"
					filterUnits="objectBoundingBox"
					id="a"
				>
					<feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
					<feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
					<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" in="shadowBlurOuter1"/>
				</filter>
			</defs>
			<g transform="translate(-166 -118)" fillRule="evenodd">
				{props.shadowed &&
					<use filter="url(#a)" xlinkHref="#b"/>}
				<use xlinkHref="#b"/>
			</g>
		</svg>
	</IconBase>
);

PlayButtonIcon.propTypes = {
	shadowed: PropTypes.bool
};

export default PlayButtonIcon;
