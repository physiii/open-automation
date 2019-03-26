import React from 'react';
import PropTypes from 'prop-types';
import SelectField from './SelectField.js';
import moment from 'moment';
import './TimeField.css';

const DEFAULT_TIME = '0001-01-01T12:00:00.000Z',
	HOURS = 12,
	MINUTES = 60,
	MINUTE_WIDTH = 2;

export class TimeField extends React.Component {
	constructor (props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}

	getHourOptions () {
		const hours = [];

		for (let index = 1; index < HOURS + 1; index++) {
			hours.push({value: index});
		}

		// Make 12 the first in the list.
		hours.unshift(hours.pop());

		return hours;
	}

	getMinuteOptions () {
		const minutes = [];

		for (let index = 0; index < MINUTES; index++) {
			minutes.push({
				label: this.zeroPad(index, MINUTE_WIDTH),
				value: index
			});
		}

		return minutes;
	}

	zeroPad (number, width) {
		const _number = String(number);

		return _number.length >= width
			? _number
			: new Array(width - _number.length + 1).join('0') + _number;
	}

	getMeridiem (time) {
		return time.hour() >= HOURS ? 'PM' : 'AM';
	}

	handleChange (event, currentTime) {
		const time = moment.utc(DEFAULT_TIME).hour(currentTime.hour()).minute(currentTime.minute());

		if (event.target.name === this.props.name + 'hour') {
			let hour = parseInt(event.target.value, 10);

			if (this.getMeridiem(time) === 'PM' && hour < HOURS) {
				hour += HOURS;
			}

			time.hour(hour);
		} else if (event.target.name === this.props.name + 'minute') {
			time.minute(event.target.value);
		} else if (event.target.name === this.props.name + 'meridiem') {
			if (event.target.value === 'AM' && time.hour() >= HOURS) {
				time.subtract(HOURS, 'hours');
			} else if (event.target.value === 'PM' && time.hour() < HOURS) {
				time.add(HOURS, 'hours');
			}
		}

		if (typeof this.props.onChange === 'function') {
			this.props.onChange({
				type: event.type,
				target: {
					name: this.props.name,
					value: time.toISOString()
				}
			});
		}
	}

	render () {
		const {label, name, value, ...inputProps} = this.props;
		let currentTime = moment.utc(value || DEFAULT_TIME);

		if (!currentTime.isValid()) {
			currentTime = moment.utc(DEFAULT_TIME);
		}

		inputProps.onChange = (event) => this.handleChange(event, currentTime);

		return (
			<div styleName="container">
				<label>{this.props.label}</label>
				<div styleName="field">
					<div styleName="hour">
						<SelectField
							{...inputProps}
							name={name + 'hour'}
							value={this.getMeridiem(currentTime) === 'PM'
								? (currentTime.hour() - HOURS) || HOURS
								: currentTime.hour() || HOURS}
							options={this.getHourOptions()} />
					</div>
					<div styleName="minute">
						<SelectField
							{...inputProps}
							name={name + 'minute'}
							value={currentTime.minute()}
							options={this.getMinuteOptions()} />
					</div>
					<div styleName="meridiem">
						<SelectField
							{...inputProps}
							name={name + 'meridiem'}
							value={this.getMeridiem(currentTime)}
							options={[{value: 'AM'}, {value: 'PM'}]} />
					</div>
				</div>
			</div>
		);
	}
}

TimeField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	disabled: PropTypes.bool,
	options: PropTypes.array,
	onChange: PropTypes.func
};

export default TimeField;
