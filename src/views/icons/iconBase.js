import React from 'react';
import PropTypes from 'prop-types';
import styles from './iconBase.css';

export default (Icon, shouldPassHoveredState) => {
	class IconBase extends React.Component {
		constructor (props) {
			super(props);

			this.state = {
				isHovered: false
			};

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
			const {size, onClick, ...props} = this.props,
				iconProps = {
					className: styles.icon,
					width: size,
					height: size,
					preserveAspectRatio: 'xMidYMid meet',
					...props
				};

			if (shouldPassHoveredState) {
				iconProps.isHovered = this.state.isHovered;
			}

			return (
				<span
					className={styles.wrapper}
					onMouseOver={this.handleMouseOver}
					onMouseOut={this.handleMouseOut}
					onClick={onClick}>
					<Icon {...iconProps} />
				</span>
			);
		}
	}

	IconBase.propTypes = {
		size: PropTypes.number,
		onClick: PropTypes.func
	};

	IconBase.defaultProps = {
		size: 40
	};

	return IconBase;
};
