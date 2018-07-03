import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import List from './List.js';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import {connect} from 'react-redux';
import {serviceById, recordingsForDate, recordingById} from '../../state/ducks/services-list/selectors.js';
import {fetchCameraRecordings} from '../../state/ducks/services-list/operations.js';
import {loadScreen, unloadScreen} from '../../state/ducks/navigation/operations.js';
import './CameraRecordings.css';

momentDurationFormatSetup(moment);

export class CameraRecordings extends React.Component {
	constructor (props) {
		super(props);

		this.goToDate = this.goToDate.bind(this);
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

	goToDate (date) {
		// Update current URL to new selected date.
		this.props.history.replace(this.getPathForDate(date));
	}

	playRecording (recordingId) {
		this.props.history.replace(this.getPathForDate(this.props.selectedDate) + '/' + recordingId);
	}

	render () {
		let list;

		if (this.props.selectedDateRecordings && this.props.selectedDateRecordings.length) {
			list = (<List
				title={this.props.selectedDate.format('MMMM Do')}
				items={this.props.selectedDateRecordings.map((recording) => ({
					id: recording.id,
					label: moment(recording.date).format('h:mm A'),
					icon: <PlayButtonIcon size={24} />,
					meta: 'Movement for ' + moment.duration(recording.duration, 'seconds').humanize(),
					onClick: () => this.playRecording(recording.id)
				}))}
			/>);
		} else if (this.props.error) {
			list = <p>{this.props.error}</p>;
		} else {
			list = <p>No Recordings for the Selected Date</p>;
		}

		return (
			<div styleName="screen">
				<div styleName={this.props.selectedRecording ? 'topRecordingSelected' : 'top'}>
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
								onSelect={this.goToDate} />}
					</div>
					{this.props.selectedRecording &&
						<a href="#" styleName="closeButton" onClick={(event) => {
							event.preventDefault();
							this.goToDate(this.props.selectedDate);
						}}>
							Close
						</a>}
				</div>
				<div styleName="bottom">
					<div styleName="list">
						{this.props.isLoading
							? <div>Loading Recordings</div>
							: list}
					</div>
				</div>
			</div>
		);
	}
}

CameraRecordings.propTypes = {
	cameraService: PropTypes.object,
	selectedDate: PropTypes.object,
	allRecordings: PropTypes.array,
	selectedDateRecordings: PropTypes.array,
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
			cameraService: cameraService.toJS(),
			selectedDate,
			allRecordings: cameraService.recordingsList.recordings.toList().toJS(),
			selectedDateRecordings: recordingsForDate(cameraService, selectedDate).toList().toJS(),
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
