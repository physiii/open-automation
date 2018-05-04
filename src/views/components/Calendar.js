import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../styles/modules/_Calendar.scss';

export class Calendar extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			date: null
		};
	}

	static getDerivedStateFromProps (nextProps, prevState) {
		return {
			...prevState,
			date: nextProps.date
		};
	}

	getNumberOfDaysInMonth (date) {
		const addOneMonth = 1,
			lastDayOfPreviousMonth = 0;

		return new Date(
			date.getYear(),
			date.getMonth() + addOneMonth,
			lastDayOfPreviousMonth
		).getDate();
	}

	getDatesList (date) {
		const daysInMonth = new Array(this.getNumberOfDaysInMonth(date)),
			weeksInMonth = [[]],
			firstDayOfWeek = 0; // 0 = Sunday

		let dayOfMonth;

		for (let dayIndex = 0, weekIndex = 0; dayIndex < daysInMonth.length; dayIndex++) {
			dayOfMonth = dayIndex + 1;
			dayOfMonth = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);

			// If this is the first day of the week, start a new calendar week.
			// (Except if we haven't added any days to the first week.)
			if (dayOfMonth.getDay() === firstDayOfWeek && dayIndex > 0) {
				weekIndex += 1;
				weeksInMonth[weekIndex] = [];
			}

			weeksInMonth[weekIndex].push(dayOfMonth);
			daysInMonth[dayIndex] = dayOfMonth;
		}

		return weeksInMonth;
	}

	doesDateHaveEvent (date, events) {
		if (!(events instanceof Array)) {
			return false;
		}

		return Boolean(events.find((event) => moment(event).isSame(date, 'day')));
	}

	render () {
		const date = moment(this.state.date);

		return (
			<time className="oa-Calendar">
				<span>{date.format('MMMM YYYY')}</span>
				<div className="oa-Calendar--weekHeading">
					<div className="oa-Calendar--dayHeading">Sun</div>
					<div className="oa-Calendar--dayHeading">Mon</div>
					<div className="oa-Calendar--dayHeading">Tue</div>
					<div className="oa-Calendar--dayHeading">Wed</div>
					<div className="oa-Calendar--dayHeading">Thu</div>
					<div className="oa-Calendar--dayHeading">Fri</div>
					<div className="oa-Calendar--dayHeading">Sat</div>
				</div>
				{this.getDatesList(this.state.date).map((week, index) => (
					<time className={index === 0 ? 'oa-Calendar--firstWeek' : 'oa-Calendar--week'}>
						{week.map((day) => (
							<time className={
								'oa-Calendar--day' +
								(this.doesDateHaveEvent(day, this.props.events) ? ' oa-is-event' : '')
							}>
								{day.getDate()}
							</time>
						))}
					</time>
				))}
			</time>
		);
	}
}

Calendar.propTypes = {
	date: PropTypes.object,
	events: PropTypes.array
};

Calendar.defaultProps = {
	date: new Date()
};

export default Calendar;
