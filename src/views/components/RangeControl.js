import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Range = Slider.Range;

export class RangeControl extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			value: props.value,
			is_changing: false
		};
	}

	onBeforeChange () {
		if (this.state.is_changing) {
			return;
		}

		this.setState({
			value: this.props.value,
			is_changing: true
		});
	}

	handleInput (value) {
		this.setState({value});

		if (typeof this.props.onInput === 'function') {
			this.props.onInput(value);
		}
	}

	handleChange (value) {
		this.setState({
			value,
			is_changing: false
		});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(value);
		}
	}

	render () {
		return (
			<Range
				onBeforeChange={this.onBeforeChange.bind(this)}
				onChange={this.handleInput.bind(this)}
				step={1}
				allowCross={false}
				defaultValue={[this.props.min, this.props.max]}
				min={60}
				max={80}
				onAfterChange={this.handleChange.bind(this)}
				disabled={this.props.disabled}/>
		);
	}
}

RangeControl.propTypes = {
	value: PropTypes.number,
	tooltip: PropTypes.bool,
	onChange: PropTypes.func,
	onInput: PropTypes.func,
	disabled: PropTypes.bool,
	min: PropTypes.number,
	max: PropTypes.number
};

RangeControl.defaultProps = {
	value: 0
};

export default RangeControl;
