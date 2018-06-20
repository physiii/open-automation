import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import './Button.css';

export class Button extends React.Component {
	constructor (props) {
		super(props);

		this.submitInput = React.createRef();
	}

	render () {
		let className;

		switch (this.props.type) {
			case 'filled':
				className = 'filledButton';
				break;
			case 'outlined':
				className = 'outlinedButton';
				break;
			case 'link':
			default:
				className = 'button';
				break;
		}

		if (this.props.to) {
			return <Link styleName={className} to={this.props.to}>{this.props.children}</Link>;
		}

		return [
			<a href="#" key="button" onClick={(event) => {
				event.preventDefault();

				if (this.props.submitForm) {
					this.submitInput.current.click();
				}

				if (typeof this.props.onClick === 'function') {
					this.props.onClick(event);
				}
			}} styleName={className}>{this.props.children}</a>,
			this.props.submitForm
				? <input styleName="submit" type="submit" key="submit" ref={this.submitInput} />
				: null
		];
	}
}

Button.propTypes = {
	to: PropTypes.string,
	type: PropTypes.string,
	submitForm: PropTypes.bool,
	onClick: PropTypes.func,
	children: PropTypes.node.isRequired
};

export default Button;
