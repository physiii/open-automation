import React from 'react';
import PropTypes from 'prop-types';
import {getUniqueId} from '../../utilities.js';
import './TextField.css';

const labelScale = 0.75;

export class TextField extends React.PureComponent {
	constructor (props) {
		super(props);

		this.state = {
			isFocused: false,
			isOutlineSetUp: false
		};

		this.inputId = getUniqueId();
		this.clipPathId = getUniqueId();
		this.field = React.createRef();
		this.label = React.createRef();

		this.outlineRadius = 0;
		this.outlineWidth = 0;
		this.outlineHeight = 0;

		this.setUpOutline = this.setUpOutline.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	componentDidUpdate (previousProps) {
		if (!this.state.isFocused) {
			return;
		}

		// Re-render with the new outline notch width when the label changes.
		if (this.props.label !== previousProps.label) {
			this.forceUpdate();
		}
	}

	setUpOutline () {
		if (this.state.isOutlineSetUp) {
			return;
		}

		this.refreshOutlineMeasurements();
		this.setState({isOutlineSetUp: true});
	}

	handleFocus (event) {
		this.setState({isFocused: true});

		if (typeof this.props.onFocus === 'function') {
			this.props.onFocus(event);
		}
	}

	handleBlur (event) {
		this.setState({isFocused: false});

		if (typeof this.props.onBlur === 'function') {
			this.props.onBlur(event);
		}
	}

	refreshOutlineMeasurements () {
		this.labelWidth = (this.label.current && this.label.current.offsetWidth * labelScale) || 0;
		this.outlineRadius = (this.field.current && parseFloat(window.getComputedStyle(this.field.current).getPropertyValue('border-top-left-radius'))) || 0;
		this.outlineWidth = (this.field.current && this.field.current.offsetWidth) || 0;
		this.outlineHeight = (this.field.current && this.field.current.offsetHeight) || 0;
	}

	getOutlinePath (inputProps) {
		const notchPadding = 8,
			labelWidth = this.state.isFocused || inputProps.value.length > 0 ? this.labelWidth : 0,
			radius = this.outlineRadius,
			width = this.outlineWidth + 2, // eslint-disable-line no-magic-numbers
			height = this.outlineHeight + 2, // eslint-disable-line no-magic-numbers
			cornerWidth = radius + 1,
			leadingStrokeLength = Math.abs(11 - cornerWidth); // eslint-disable-line no-magic-numbers

		let notchWidth = 0;

		if (labelWidth > 0) {
			notchWidth = labelWidth + notchPadding;
		}

		// The right, bottom, and left sides of the outline follow the same SVG path.
		return 'M' + (cornerWidth + leadingStrokeLength + notchWidth - 1) + ',' + 0 + // eslint-disable-line no-magic-numbers
			'h' + (width - (2 * cornerWidth) - notchWidth - leadingStrokeLength) + // eslint-disable-line no-magic-numbers
			'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + radius +
			'v' + (height - (2 * cornerWidth)) + // eslint-disable-line no-magic-numbers
			'a' + radius + ',' + radius + ' 0 0 1 ' + -radius + ',' + radius +
			'h' + (-width + (2 * cornerWidth)) + // eslint-disable-line no-magic-numbers
			'a' + radius + ',' + radius + ' 0 0 1 ' + -radius + ',' + -radius +
			'v' + (-height + (2 * cornerWidth)) + // eslint-disable-line no-magic-numbers
			'a' + radius + ',' + radius + ' 0 0 1 ' + radius + ',' + -radius +
			'h' + leadingStrokeLength;
	}

	getFieldClasses (inputProps) {
		let fieldClasses = 'field';

		if (this.state.isFocused) {
			fieldClasses += ' isFocused';
		}

		if (this.props.error) {
			fieldClasses += ' hasError';
		}

		if (inputProps.value.length > 0) {
			fieldClasses += ' isPopulated';
		}

		if (inputProps.disabled) {
			fieldClasses += ' isDisabled';
		}

		if (this.state.isOutlineSetUp) {
			fieldClasses += ' hasNotchedOutline';
		}

		return fieldClasses;
	}

	render () {
		const {label, mask, children, altInputId, error, ...inputProps} = this.props,
			fieldMask = mask !== null && mask.toString
				? mask.toString()
				: '',
			shouldShowMask = fieldMask && this.state.isFocused;

		inputProps.value = typeof this.props.value !== 'undefined' && this.props.value !== null && this.props.value.toString
			? this.props.value.toString()
			: '';

		this.refreshOutlineMeasurements();

		const outlinePath = this.getOutlinePath(inputProps);

		// Delete props we don't want applied to the <input> element.
		delete inputProps.onFocus;
		delete inputProps.onBlur;

		return (
			<div styleName="container" onAnimationEnd={this.setUpOutline}>
				<div styleName={this.getFieldClasses(inputProps)} ref={this.field}>
					{this.state.isOutlineSetUp && <svg styleName="outlineWrapper" xmlns="http://www.w3.org/2000/svg">
						<path styleName="outline" d={outlinePath} clipPath={'url(#' + this.clipPathId + ')'} />
						<clipPath id={this.clipPathId}>
							<path d={outlinePath} />
						</clipPath>
					</svg>}
					<label htmlFor={altInputId || this.inputId} styleName="label" ref={this.label}>{label}</label>
					{shouldShowMask && <span styleName="mask">{fieldMask}</span>}
					<input
						{...inputProps}
						styleName="input"
						id={this.inputId}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
					{children}
				</div>
				<div styleName="bottom">
					{error && !inputProps.disabled &&
						<span styleName="errorMessage">{error}</span>}
				</div>
			</div>
		);
	}
}

TextField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	mask: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	altInputId: PropTypes.string,
	children: PropTypes.node,
	error: PropTypes.string,
	type: PropTypes.oneOf([
		'text',
		'search',
		'tel',
		'url',
		'email',
		'password'
	]),
	disabled: PropTypes.bool,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

TextField.defaultProps = {
	value: '',
	mask: '',
	type: 'text'
};

export default TextField;
