import React from 'react';
import PropTypes from 'prop-types';
import PrivateRoute from '../components/PrivateRoute.js';
import Button from './Button.js';
import Calendar from './Calendar.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {deviceById, cameraRecordingsDateGrouped} from '../../state/ducks/devices-list/selectors.js';
import {fetchCameraRecordings} from '../../state/ducks/devices-list/operations.js';

export class CameraRecordings extends React.Component {
	componentDidMount () {
		this.props.getRecordings(this.props.camera);
	}

	render () {
		return (
			<PrivateRoute path={`${this.props.match.path}/:year?/:month?/:date?`} render={(routeProps) => {
				const {year: selectedYear, month: selectedMonth, date: selectedDate} = routeProps.match.params,
					yearsList = this.props.recordings,
					monthsList = selectedYear && yearsList ? yearsList.get(Number(selectedYear)) : null,
					datesList = selectedMonth && monthsList ? monthsList.get(Number(selectedMonth)) : null,
					recordingsList = selectedDate && datesList ? datesList.get(Number(selectedDate)) : null;

				let list, backUrl;

				if (recordingsList) {
					list = recordingsList.map((recording) => <li key={recording.date}><Button to={`${routeProps.match.url}/${recording.file}`}>{recording.date}</Button></li>);
					backUrl = `${this.props.match.url}/${selectedYear}/${selectedMonth}`;
				} else if (datesList) {
					list = datesList.keySeq().map((date) => <li key={date}><Button to={`${routeProps.match.url}/${date}`}>{date}</Button></li>);
					backUrl = `${this.props.match.url}/${selectedYear}`;
				} else if (monthsList) {
					list = monthsList.keySeq().map((month) => <li key={month}><Button to={`${routeProps.match.url}/${month}`}>{month}</Button></li>);
					backUrl = this.props.match.url;
				} else if (yearsList) {
					list = yearsList.keySeq().map((year) => <li key={year}><Button to={`${routeProps.match.url}/${year}`}>{year}</Button></li>);
					backUrl = this.props.parentPath;
				} else {
					list = 'No Recordings';
					backUrl = this.props.parentPath;
				}

				return (
					<div>
						<Button to={backUrl}>Back</Button>
						<Calendar
							events={this.props.camera.recordingsList.recordings.map((recording) => new Date(recording.date)).toJS()}
						/>
						{this.props.isLoading
							? <div>Loading Recordings</div>
							: <ol>
								{list}
							</ol>
						}
					</div>
				);
			}} />
		);
	}
}

CameraRecordings.propTypes = {
	camera: PropTypes.object, // TODO: Immutable Record proptype (also allow object)
	recordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	getRecordings: PropTypes.func,
	isLoading: PropTypes.bool,
	match: PropTypes.object,
	parentPath: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
		const camera = deviceById(ownProps.cameraId, state.devicesList);

		return {
			camera,
			recordings: cameraRecordingsDateGrouped(camera),
			isLoading: camera.recordingsList.loading
		};
	},
	mapDispatchToProps = (dispatch) => {
		return {
			getRecordings: (camera) => dispatch(fetchCameraRecordings(camera))
		};
	};

export default connect(mapStateToProps, mapDispatchToProps)(CameraRecordings);
