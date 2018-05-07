import React from 'react';
import PropTypes from 'prop-types';
import Calendar from './Calendar.js';
import VideoStream from './VideoStream.js';
import List from './List.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {deviceById, recordingsForDate, recordingById} from '../../state/ducks/devices-list/selectors.js';
import {fetchCameraRecordings} from '../../state/ducks/devices-list/operations.js';

export class CameraRecordings extends React.Component {
	constructor (props) {
		super(props);

		this.onDateSelect = this.onDateSelect.bind(this);
	}

	componentDidMount () {
		this.props.fetchRecordings(this.props.camera);
	}

	getPathForDate (date) {
		return `${this.props.basePath}/${this.props.camera.id}/${date.year()}/${date.month() + 1}/${date.date()}`; // Add 1 to month because moment months are zero-based. This just makes the url one-based.
	}

	onDateSelect (date) {
		// Update current URL to new selected date.
		this.props.history.push(this.getPathForDate(date));
	}

	render () {
		return (
			<div>
				{this.props.isLoading
					? <div>Loading Recordings</div>
					: <div>
						{this.props.selectedRecording
							? <VideoStream
								camera={this.props.camera}
								file={this.props.selectedRecording.file}
								shouldStream={true} />
							: <Calendar
								selectedDate={this.props.selectedDate}
								events={this.props.allRecordings}
								onSelect={this.onDateSelect} />}
						{this.props.selectedDateRecordings && this.props.selectedDateRecordings.size
							? <List items={this.props.selectedDateRecordings.map((recording) => ({
								id: recording.id,
								label: moment(recording.date).format('h:mm A'),
								link: `${this.getPathForDate(this.props.selectedDate)}/${recording.id}`
							}))} />
							: 'No Recordings for the Selected Date'}
					</div>
				}
			</div>
		);
	}
}

CameraRecordings.propTypes = {
	camera: PropTypes.object, // TODO: Immutable Record proptype (also allow object)
	selectedDate: PropTypes.object,
	allRecordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	selectedDateRecordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	selectedRecording: PropTypes.object,
	basePath: PropTypes.string,
	history: PropTypes.object,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
		const camera = deviceById(ownProps.match.params.cameraId, state.devicesList),
			selectedDate = moment([
				ownProps.match.params.year,
				ownProps.match.params.month - 1, // Subtract 1 from month because moment months are zero-based.
				ownProps.match.params.date
			]);

		return {
			camera,
			selectedDate,
			allRecordings: camera.recordingsList ? camera.recordingsList.recordings : null,
			selectedDateRecordings: recordingsForDate(camera, selectedDate),
			selectedRecording: recordingById(camera, ownProps.match.params.recordingId),
			isLoading: camera.recordingsList.loading
		};
	},
	mapDispatchToProps = (dispatch) => ({
		fetchRecordings: (camera) => dispatch(fetchCameraRecordings(camera))
	});

export default connect(mapStateToProps, mapDispatchToProps)(CameraRecordings);
