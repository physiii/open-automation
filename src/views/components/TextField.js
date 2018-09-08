import React from 'react';
import PropTypes from 'prop-types';
import {getUniqueId} from '../../utilities.js';
import './TextField.css';

export class TextField extends React.PureComponent {
	constructor (props) {
		super(props);

		this.state = {isFocused: false};

		this.inputId = getUniqueId();

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
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

		return fieldClasses;
	}

	render () {
		const {label, mask, error, ...inputProps} = this.props,
			fieldMask = mask !== null && mask.toString
				? mask.toString()
				: '',
			shouldShowMask = fieldMask && this.state.isFocused;

		inputProps.value = typeof this.props.value !== 'undefined' && this.props.value !== null && this.props.value.toString
			? this.props.value.toString()
			: '';

		// Delete props we don't want applied to the <input> element.
		delete inputProps.onFocus;
		delete inputProps.onBlur;

		return (
			<div styleName="container">
				<div styleName={this.getFieldClasses(inputProps)}>
					<label htmlFor={this.inputId} styleName="label">{label}</label>
					{shouldShowMask && <span styleName="mask">{fieldMask}</span>}
					<input
						{...inputProps}
						styleName="input"
						id={this.inputId}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
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
