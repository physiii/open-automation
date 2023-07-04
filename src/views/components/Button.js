import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import styles from './Button.css';

export class Button extends React.Component {
	constructor (props) {
		super(props);

		this.submitInput = React.createRef();
	}

	render () {
		const children = (
			<React.Fragment>
				{this.props.icon && <span className={styles.icon}>{this.props.icon}</span>}
				<span className={styles.label}>{this.props.children}</span>
			</React.Fragment>
		);

		let className;

		switch (this.props.type) {
			case 'tab':
				className = 'tabButton';
				break;
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

		if (this.props.to && !this.props.disabled) {
			return <Link className={styles[className]} to={this.props.to} onClick={this.props.onClick}>{children}</Link>;
		}

		return [
			<button key="button" onClick={(event) => {
				event.preventDefault();

				if (this.props.submitForm) {
					this.submitInput.current.click();
				}

				if (typeof this.props.onClick === 'function') {
					this.props.onClick(event);
				}
			}} className={styles[className]} disabled={this.props.disabled}>{children}</button>,
			this.props.submitForm && <input className={styles.submit} type="submit" key="submit" ref={this.submitInput} />
		];
	}
}

Button.propTypes = {
	to: PropTypes.string,
	type: PropTypes.string,
	submitForm: PropTypes.bool,
	onClick: PropTypes.func,
	icon: PropTypes.node,
	children: PropTypes.node.isRequired,
	disabled: PropTypes.bool
};

export default Button;
