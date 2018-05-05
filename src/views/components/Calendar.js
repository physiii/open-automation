import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from './Toolbar.js';
import Button from './Button.js';
import moment from 'moment';
import '../styles/modules/_Calendar.scss';

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

	componentDidMount () {
		if (this.state.selectedDate) {
			this.selectDate(this.state.selectedDate);
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
		if (!(events instanceof Array)) {
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
			<time className="oa-Calendar" datetime={month.format('YYYY')}>
				<Toolbar
					leftChildren={<Button className="oa-Calendar--previousMonthButton" onClick={this.selectPreviousMonth}>&lt;</Button>}
					middleChildren={month.format('MMMM YYYY')}
					rightChildren={<Button className="oa-Calendar--nextMonthButton" onClick={this.selectNextMonth}>&gt;</Button>} />
				<div className="oa-Calendar--weekHeading">
					<div className="oa-Calendar--dayHeading">Sun</div>
					<div className="oa-Calendar--dayHeading">Mon</div>
					<div className="oa-Calendar--dayHeading">Tue</div>
					<div className="oa-Calendar--dayHeading">Wed</div>
					<div className="oa-Calendar--dayHeading">Thu</div>
					<div className="oa-Calendar--dayHeading">Fri</div>
					<div className="oa-Calendar--dayHeading">Sat</div>
				</div>
				{this.getWeeksList(month).map((week, weekIndex) => {
					const weekDate = moment(month).add(weekIndex, 'weeks');

					return (
						<time
							className={weekIndex === 0 ? 'oa-Calendar--firstWeek' : 'oa-Calendar--week'}
							datetime={weekDate.format('YYYY-[W]w')}
							key={weekIndex}>
							{week.map((day, dayIndex) => (
								<time
									className={
										'oa-Calendar--day' +
										(this.doesDateHaveEvent(day, this.props.events) ? ' oa-is-event' : '') +
										(day.isSame(this.state.selectedDate, 'day') ? ' oa-is-selected' : '')
									}
									datetime={day.format('YYYY-MM-DD')}
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
	events: PropTypes.array,
	onSelect: PropTypes.func
};

Calendar.defaultProps = {
	events: []
};

export default Calendar;
