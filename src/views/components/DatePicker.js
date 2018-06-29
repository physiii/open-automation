import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import moment from 'moment';
import './DatePicker.css';

export class DatePicker extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			selectedDate: null,
			selectedMonth: props.selectedDate
				? moment(props.selectedDate).startOf('month')
				: moment().startOf('month')
		};

		this.selectDate = this.selectDate.bind(this);
		this.selectPreviousMonth = this.selectPreviousMonth.bind(this);
		this.selectNextMonth = this.selectNextMonth.bind(this);
	}

	static getDerivedStateFromProps (nextProps, previousState) {
		const nextState = {...previousState};

		if (nextProps.selectedMonth) {
			nextState.selectedMonth = moment(nextProps.selectedMonth).startOf('month');
		}

		if (nextProps.selectedDate) {
			nextState.selectedDate = moment(nextProps.selectedDate);
		}

		return nextState;
	}

	getNumberOfDaysInMonth (date) {
		const addOneMonth = 1,
			lastDayOfPreviousMonth = 0,
			// Make sure date is a JavaScript Date. Moment doesn't support overflow date calculations.
			jsDate = date.toDate();

		return new Date(
			jsDate.getYear(),
			jsDate.getMonth() + addOneMonth,
			lastDayOfPreviousMonth
		).getDate();
	}

	getWeeksList (month) {
		const weeksList = [[]],
			daysInMonth = this.getNumberOfDaysInMonth(month),
			firstDayOfWeek = 0; // 0 = Sunday

		let day;

		// Build list of weeks and days.
		for (let dayIndex = 0, weekIndex = 0; dayIndex < daysInMonth; dayIndex++) {
			day = moment([
				month.year(),
				month.month(),
				dayIndex + 1
			]);

			// If this is the first day of the week, start a new calendar week.
			// (Except if we haven't yet added any days to the first week.)
			if (day.day() === firstDayOfWeek && dayIndex > 0) {
				weekIndex += 1; // Move to the next week.
				weeksList[weekIndex] = []; // Add new array for the next week to the list.
			}

			weeksList[weekIndex].push(day);
		}

		return weeksList;
	}

	doesDateHaveEvent (date) {
		return Boolean(this.props.events.find((event) => date.isSame(event.date, 'day')));
	}

	selectDate (date) {
		this.setState({selectedDate: date});

		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(date);
		}
	}

	selectPreviousMonth () {
		this.setState({selectedMonth: this.state.selectedMonth.subtract(1, 'month')});
	}

	selectNextMonth () {
		this.setState({selectedMonth: this.state.selectedMonth.add(1, 'month')});
	}

	render () {
		const month = this.state.selectedMonth;

		return (
			<div styleName="datePicker">
				<time styleName="calendar" dateTime={month.format('YYYY')}>
					<div styleName="monthHeader">
						<div styleName="previousMonthButton">
							<Button onClick={this.selectPreviousMonth}>&lt;</Button>
						</div>
						<h2>{month.format('MMMM YYYY')}</h2>
						<div styleName="nextMonthButton">
							<Button onClick={this.selectNextMonth}>&gt;</Button>
						</div>
					</div>
					<div styleName="weekHeader">
						<div styleName="dayHeading">Sun</div>
						<div styleName="dayHeading">Mon</div>
						<div styleName="dayHeading">Tue</div>
						<div styleName="dayHeading">Wed</div>
						<div styleName="dayHeading">Thu</div>
						<div styleName="dayHeading">Fri</div>
						<div styleName="dayHeading">Sat</div>
					</div>
					{this.getWeeksList(month).map((week, weekIndex) => {
						const weekDate = moment(month).add(weekIndex, 'weeks'); // Create a new Moment date based on month so we don't mutate month.

						return (
							<time
								styleName={weekIndex === 0 ? 'firstWeek' : 'week'}
								dateTime={weekDate.format('YYYY-[W]w')}
								key={weekIndex}>
								{week.map((day, dayIndex) => {
									const isDaySelected = day.isSame(this.state.selectedDate, 'day'),
										doesDayHaveEvent = this.doesDateHaveEvent(day),
										onDateClick = (event) => {
											event.preventDefault();

											if (doesDayHaveEvent) {
												this.selectDate(day);
											}
										};

									return (
										<time styleName="day" dateTime={day.format('YYYY-MM-DD')} key={dayIndex}>
											<a
												href="#"
												styleName={
													(isDaySelected ? 'selectedDayLink' : 'dayLink') +
													(doesDayHaveEvent ? ' dayWithEvent' : '')
												}
												onClick={onDateClick}>
												{day.date()}
											</a>
										</time>
									);
								})}
							</time>
						);
					})}
				</time>
				<div styleName="aspectRatio" />
			</div>
		);
	}
}

DatePicker.propTypes = {
	selectedDate: PropTypes.object,
	selectedMonth: PropTypes.object,
	events: PropTypes.array,
	onSelect: PropTypes.func
};

DatePicker.defaultProps = {
	events: []
};

export default DatePicker;
