import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import moment from 'moment';
import './DatePicker.css';

export class DatePicker extends React.Component {
	constructor (props) {
		super(props);

		this.selectDate = this.selectDate.bind(this);
		this.selectPreviousMonth = this.selectPreviousMonth.bind(this);
		this.selectNextMonth = this.selectNextMonth.bind(this);

		this.state = {
			selectedMonth: props.selectedDate
				? moment(props.selectedDate).startOf('month')
				: moment().startOf('month')
		};
	}

	componentDidUpdate (previousProps, previousState) {
		if (!this.state.selectedMonth.isSame(previousState.selectedMonth, 'month') && typeof this.props.onMonthChange === 'function') {
			this.props.onMonthChange(this.state.selectedMonth);
		}
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
			firstDayOfWeek = 0, // 0 = Sunday
			week5Index = 4,
			week6Index = 5;

		let day;

		// Ensure the list of weeks always has six weeks so the layout doesn't
		// shift when switching months.
		weeksList[week5Index] = [];
		weeksList[week6Index] = [];

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

	isDateEnabled (date) {
		if (this.props.enabledDates) {
			return this.props.enabledDates.find((enabledDate) => {
				const month = parseInt(date._i[1]) + 1,
					_date = date._i[0] + '-' + month + '-' + date._i[2];

				return enabledDate._i === _date;
			});
		}

		return true;
	}

	selectDate (date) {
		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(date);
		}
	}

	selectPreviousMonth () {
		this.setState({selectedMonth: this.state.selectedMonth.clone().subtract(1, 'month')});
	}

	selectNextMonth () {
		this.setState({selectedMonth: this.state.selectedMonth.clone().add(1, 'month')});
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

						if (!week.length) {
							return <div styleName="week" key={weekIndex} />;
						}

						return (
							<time
								styleName={weekIndex === 0 ? 'firstWeek' : 'week'}
								dateTime={weekDate.format('YYYY-[W]w')}
								key={weekIndex}>
								{week.map((day, dayIndex) => {
									const isDaySelected = day.isSame(this.props.selectedDate, 'day'),
										isDayEnabled = this.isDateEnabled(day),
										onDateClick = (event) => {
											event.preventDefault();

											if (!isDayEnabled) {
												return;
											}

											this.selectDate(day);
										};

									return (
										<time styleName="day" dateTime={day.format('YYYY-MM-DD')} key={dayIndex}>
											<a
												href="#"
												styleName={
													(isDaySelected ? 'selectedDayLink' : 'dayLink') +
													(isDayEnabled ? ' enabledDay' : '')
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
	enabledDates: PropTypes.array,
	onSelect: PropTypes.func,
	onMonthChange: PropTypes.func
};

DatePicker.defaultProps = {
	enabledDates: []
};

export default DatePicker;
