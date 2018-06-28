import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import List from './List.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {serviceById, recordingsForDate, recordingById} from '../../state/ducks/services-list/selectors.js';
import {fetchCameraRecordings} from '../../state/ducks/services-list/operations.js';
import {loadScreen, unloadScreen} from '../../state/ducks/navigation/operations.js';
import './CameraRecordings.css';

export class CameraRecordings extends React.Component {
	constructor (props) {
		super(props);

		this.onDateSelect = this.onDateSelect.bind(this);
	}

	componentDidMount () {
		this.props.navigationLoadScreen();

		if (this.props.cameraService) {
			this.props.fetchRecordings(this.props.cameraService);
		}
	}

	componentWillUnmount () {
		this.props.navigationUnloadScreen();
	}

	getPathForDate (date) {
		return `${this.props.basePath}/${this.props.cameraService.id}/${date.year()}/${date.month() + 1}/${date.date()}`; // Add 1 to month because moment months are zero-based. This just makes the url one-based.
	}

	onDateSelect (date) {
		// Update current URL to new selected date.
		this.props.history.push(this.getPathForDate(date));
	}

	render () {
		let list;

		if (this.props.selectedDateRecordings && this.props.selectedDateRecordings.size) {
			list = (<List items={this.props.selectedDateRecordings.map((recording) => ({
				id: recording.id,
				label: moment(recording.date).format('h:mm A'),
				meta: 'Motion detected for ' + moment.duration(recording.duration, 'seconds').humanize(),
				link: `${this.getPathForDate(this.props.selectedDate)}/${recording.id}`
			}))} />);
		} else if (this.props.error) {
			list = <p>{this.props.error}</p>;
		} else {
			list = <p>No Recordings for the Selected Date</p>;
		}

		return (
			<div styleName="screen">
				<div styleName="top">
					<div styleName="topCenterer">
						{this.props.selectedRecording
							? <VideoPlayer
								cameraServiceId={this.props.cameraService.id}
								recording={this.props.selectedRecording}
								key={this.props.selectedRecording.id}
								streamingToken={this.props.selectedRecording.streaming_token}
								width={this.props.selectedRecording.width}
								height={this.props.selectedRecording.height}
								autoplay={true} />
							: <DatePicker
								selectedDate={this.props.selectedDate}
								events={this.props.allRecordings}
								onSelect={this.onDateSelect} />}
					</div>
				</div>
				<div styleName="list">
					{this.props.isLoading
						? <div>Loading Recordings</div>
						: list}
				</div>
			</div>
		);
	}
}

CameraRecordings.propTypes = {
	cameraService: PropTypes.object, // TODO: Immutable Record proptype (also allow object)
	selectedDate: PropTypes.object,
	allRecordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	selectedDateRecordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	selectedRecording: PropTypes.object,
	basePath: PropTypes.string,
	history: PropTypes.object,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func,
	navigationLoadScreen: PropTypes.func,
	navigationUnloadScreen: PropTypes.func,
	error: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
		const cameraService = serviceById(ownProps.match.params.cameraId, state.servicesList);

		let selectedDate = moment([
			ownProps.match.params.year,
			ownProps.match.params.month - 1, // Subtract 1 from month because moment months are zero-based.
			ownProps.match.params.date
		]);

		if (!selectedDate.isValid()) {
			selectedDate = moment();
		}

		if (!cameraService) {
			return {
				error: 'There was a problem with loading the camera’s recordings.'
			};
		}

		return {
			cameraService,
			selectedDate,
			allRecordings: cameraService.recordingsList ? cameraService.recordingsList.recordings : null,
			selectedDateRecordings: recordingsForDate(cameraService, selectedDate),
			selectedRecording: recordingById(cameraService, ownProps.match.params.recordingId),
			isLoading: cameraService.recordingsList.loading
		};
	},
	mapDispatchToProps = (dispatch, ownProps) => ({
		dispatch,
		navigationUnloadScreen: () => dispatch(unloadScreen(ownProps.basePath)),
		fetchRecordings: (cameraService) => dispatch(fetchCameraRecordings(cameraService.id))
	}),
	mergeProps = (stateProps, dispatchProps, ownProps) => {
		const {dispatch, ...restOfDispatchProps} = dispatchProps,
			cameraName = stateProps.cameraService.settings.name || 'Camera';

		return {
			...ownProps,
			...stateProps,
			...restOfDispatchProps,
			navigationLoadScreen: () => dispatch(loadScreen(ownProps.basePath, ownProps.parentPath, cameraName + ' Recordings'))
		};
	};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CameraRecordings);
