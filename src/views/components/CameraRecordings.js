import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import Button from './Button.js';
import Calendar from './Calendar.js';
import VideoStream from './VideoStream.js';
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

	onDateSelect (date) {
		// Update current URL to new selected date.
		this.props.history.push(`${this.props.match.url}/${date.year()}/${date.month() + 1}/${date.date()}`); // Add 1 to month because moment months are zero-based. This just makes the url one-based.
	}

	render () {
		const recordingDatesList = this.props.camera && this.props.camera.recordingsList.recordings
			? this.props.camera.recordingsList.recordings.map((recording) => ({date: new Date(recording.date)})).toJS()
			: null;

		return (
			<Route path={`${this.props.match.path}/:year?/:month?/:date?`} render={(routeProps) => {
				const selectedDate = moment([
						routeProps.match.params.year,
						routeProps.match.params.month - 1, // Subtract 1 from month because moment months are zero-based.
						routeProps.match.params.date
					]),
					recordings = recordingsForDate(this.props.camera, selectedDate); // TODO: Can we stop using selectors in the component?

				return (
					<div>
						<Button to={this.props.parentPath}>Back</Button>
						{this.props.isLoading
							? <div>Loading Recordings</div>
							: <div>
								<Route path={`${routeProps.match.path}/play/:recordingId`} children={(playRouteProps) => {
									if (playRouteProps.match) {
										return (
											<VideoStream
												camera={this.props.camera}
												file={recordingById(this.props.camera, playRouteProps.match.params.recordingId).file} // TODO: Can we stop using selectors in the component?
												shouldStream={true} />
										);
									}

									return (
										<Calendar
											selectedDate={selectedDate.isValid() ? selectedDate : moment()}
											events={recordingDatesList}
											onSelect={this.onDateSelect} />
									);
								}} />
								<ol>
									{recordings && recordings.size
										? recordings.map((recording) => (
											<li key={recording.id}>
												<Button to={`${routeProps.match.url}/play/${recording.id}`}>
													{moment(recording.date).format('h:mm A')}
												</Button>
											</li>
										))
										: 'No Recordings for the Selected Date'}
								</ol>
							</div>
						}
					</div>
				);
			}} />
		);
	}
}

CameraRecordings.propTypes = {
	camera: PropTypes.object, // TODO: Immutable Record proptype (also allow object)
	fetchRecordings: PropTypes.func,
	isLoading: PropTypes.bool,
	match: PropTypes.object,
	history: PropTypes.object,
	parentPath: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
		const camera = deviceById(ownProps.cameraId, state.devicesList);

		return {
			camera,
			isLoading: camera.recordingsList.loading
		};
	},
	mapDispatchToProps = (dispatch) => ({
		fetchRecordings: (camera) => dispatch(fetchCameraRecordings(camera))
	});

export default connect(mapStateToProps, mapDispatchToProps)(CameraRecordings);
