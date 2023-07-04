import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@mui/material';

export class RangeControl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: props.value || [0, 100],
			is_changing: false,
		};
	}

	handleInput(event, newValue) {
		this.setState({ value: newValue });

		if (typeof this.props.onInput === 'function') {
			this.props.onInput(newValue);
		}
	}

	handleChange(event, newValue) {
		this.setState({
			value: newValue,
			is_changing: false,
		});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(newValue);
		}
	}

	render() {
		return (
			<Slider
				value={this.state.value}
				onChange={this.handleInput.bind(this)}
				onChangeCommitted={this.handleChange.bind(this)}
				step={1}
				valueLabelDisplay="auto"
				min={this.props.minRange}
				max={this.props.maxRange}
				disabled={this.props.disabled}
			/>
		);
	}
}

RangeControl.propTypes = {
	value: PropTypes.array,
	onChange: PropTypes.func,
	onInput: PropTypes.func,
	disabled: PropTypes.bool,
	minRange: PropTypes.number,
	maxRange: PropTypes.number,
};

RangeControl.defaultProps = {
	value: [0, 100],
};

export default RangeControl;
