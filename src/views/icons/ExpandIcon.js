import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';
import './ExpandIcon.css';

export class ExpandIcon extends React.Component {
	constructor (props) {
		super(props);

		this.state = {isHovered: false};

		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.handleMouseOut = this.handleMouseOut.bind(this);
	}

	handleMouseOver () {
		this.setState({isHovered: true});
	}

	handleMouseOut () {
		this.setState({isHovered: false});
	}

	render () {
		const {isExpanded, ...iconBaseProps} = this.props;

		return (
			<IconBase
				{...iconBaseProps}
				viewBox="0 0 22 22"
				onMouseOver={this.handleMouseOver}
				onMouseOut={this.handleMouseOut}>
				<g styleName={(this.state.isHovered ? 'isHovered' : '') + (isExpanded ? ' isExpanded' : '')} fillRule="evenodd">
					<path styleName="topArrow" d="M10.2,10.2L16.5,4L12,4l0-2h7c0.5,0,1,0.5,1,1v7h-2V5.5l-6.2,6.2L10.2,10.2z" />
					<path styleName="bottomArrow" d="M11.8,11.8L5.5,18l4.5,0l0,2H3c-0.5,0-1-0.5-1-1v-7h2v4.5l6.2-6.2L11.8,11.8z" />
				</g>
			</IconBase>
		);
	}
}

ExpandIcon.propTypes = {
	isExpanded: PropTypes.bool
};

export default ExpandIcon;
