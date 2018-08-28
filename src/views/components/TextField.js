import React from 'react';
import PropTypes from 'prop-types';
import './TextField.css';

export class TextField extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			value: '',
			is_focused: false
		};

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	static getDerivedStateFromProps (nextProps, previousState) {
		const nextState = {...previousState};

		if (typeof nextProps.value !== 'undefined') {
			nextState.value = nextProps.value && nextProps.value.toString && nextProps.value.toString();
		}

		return nextState;
	}

	handleFocus () {
		this.setState({is_focused: true});
	}

	handleBlur (event) {
		this.setState({is_focused: false});

		if (typeof this.props.onBlur === 'function') {
			this.props.onBlur(event, this.props.name);
		}
	}

	handleChange (event) {
		this.setState({value: event.target.value});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(event, this.props.name);
		}
	}

	render () {
		return (
			<div styleName="container">
				<div styleName={'field' + (this.state.is_focused ? ' fieldFocused' : '') + (this.props.error ? ' fieldError' : '')}>
					{this.state.value && this.state.value.length > 0
						? null
						: <label styleName="label">{this.props.label}</label>}
					<input
						styleName="input"
						type={this.props.type}
						value={this.state.value}
						onChange={this.handleChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
				</div>
				<div styleName="bottom">
					{this.props.error &&
						<label styleName="errorMessage">{this.props.error}</label>}
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
	error: PropTypes.string,
	type: PropTypes.oneOf([
		'text',
		'password'
	]),
	onChange: PropTypes.func,
	onBlur: PropTypes.func
};

TextField.defaultProps = {
	value: '',
	type: 'text'
};

export default TextField;
