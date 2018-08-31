import React from 'react';
import PropTypes from 'prop-types';
import {getUniqueId} from '../../utilities.js';
import './SwitchField.css';

export class SwitchField extends React.Component {
	constructor (props) {
		super(props);

		this.state = {is_focused: false};

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleFocus (event) {
		this.setState({is_focused: true});

		if (typeof this.props.onFocus === 'function') {
			this.props.onFocus(event);
		}
	}

	handleBlur (event) {
		this.setState({is_focused: false});

		if (typeof this.props.onBlur === 'function') {
			this.props.onBlur(event);
		}
	}

	render () {
		const inputId = getUniqueId();

		return (
			<div styleName="container">
				<div styleName={'field' + (this.state.is_focused ? ' isFocused' : '')}>
					<label htmlFor={inputId} styleName="label">{this.props.label}</label>
					<input
						styleName="input"
						type="checkbox"
						id={inputId}
						name={this.props.name}
						checked={this.props.checked}
						onChange={this.props.onChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
				</div>
			</div>
		);
	}
}

SwitchField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

SwitchField.defaultProps = {
	checked: false
};

export default SwitchField;
