import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';
import styles from './PlayButtonIcon.css';

export const PlayButtonIcon = ({shadowed, ...props}) => (
	<IconBase {...props} viewBox="0 0 68 68">
		<defs>
			<path id="PlayButtonIcon-main" d="M200 182c-17.673 0-32-14.327-32-32 0-17.673 14.327-32 32-32 17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32zm12.998-32L193 136l-.002 28 20-14z"/>
			<filter
				id="PlayButtonIcon-shadowedFilter"
				x="-6.2%"
				y="-3.1%"
				width="112.5%"
				height="112.5%"
				filterUnits="objectBoundingBox">
				<feOffset dy="2" in="SourceAlpha" result="shadowOffsetOuter1"/>
				<feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
				<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" in="shadowBlurOuter1"/>
			</filter>
		</defs>
		<g className={shadowed ? styles.shadowedFill : ''} transform="translate(-166 -118)" fillRule="evenodd">
			{shadowed &&
				<use filter="url(#PlayButtonIcon-shadowedFilter)" xlinkHref="#PlayButtonIcon-main"/>}
			<use xlinkHref="#PlayButtonIcon-main"/>
		</g>
	</IconBase>
);

PlayButtonIcon.propTypes = {
	shadowed: PropTypes.bool
};

export default PlayButtonIcon;
