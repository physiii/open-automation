import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import moment from 'moment';
import './Calendar.css';

export class Calendar extends React.Component {
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

	doesDateHaveEvent (date, events) {
		if (!events || !events.find) {
			return false;
		}

		return Boolean(events.find((event) => date.isSame(event.date, 'day')));
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
			<time styleName="calendar" dateTime={month.format('YYYY')}>
				<Toolbar
					leftChildren={<Button styleName="previousMonthButton" onClick={this.selectPreviousMonth}>&lt;</Button>}
					middleChildren={month.format('MMMM YYYY')}
					rightChildren={<Button styleName="nextMonthButton" onClick={this.selectNextMonth}>&gt;</Button>} />
				<div styleName="weekHeading">
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
							{week.map((day, dayIndex) => (
								<time
									styleName={
										(day.isSame(this.state.selectedDate, 'day') ? 'selectedDay' : 'day') +
										(this.doesDateHaveEvent(day, this.props.events) ? ' dayHasEvent' : '')
									}
									dateTime={day.format('YYYY-MM-DD')}
									key={dayIndex}>
									<Button onClick={() => this.selectDate(day)}>
										{day.date()}
									</Button>
								</time>
							))}
						</time>
					);
				})}
			</time>
		);
	}
}

Calendar.propTypes = {
	selectedDate: PropTypes.object,
	selectedMonth: PropTypes.object,
	events: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	onSelect: PropTypes.func
};

Calendar.defaultProps = {
	events: []
};

export default Calendar;
