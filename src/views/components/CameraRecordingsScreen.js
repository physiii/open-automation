import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import AudioPlayer from './AudioPlayer.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import List from './List.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById, getServiceNameById, cameraGetRecordingsByDate, cameraGetRecordingById, cameraGetDatesOfRecordings, cameraIsRecordingsListLoading, cameraGetRecordingsListError} from '../../state/ducks/services-list/selectors.js';
import {cameraFetchRecordings} from '../../state/ducks/services-list/operations.js';
import './CameraRecordingsScreen.css';

const playButtonIcon = <PlayButtonIcon size={24} />;

export class CameraRecordingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleDateSelected = this.handleDateSelected.bind(this);
		this.handleCloseClick = this.handleCloseClick.bind(this);

		this.state = {selectedMonth: this.props.selectedDate.startOf('month')};
	}

	componentDidMount () {
		this.props.fetchRecordings(this.props.cameraService);
	}

	componentDidUpdate (previousProps) {
		if (this.props.cameraService.state.get('connected') && !previousProps.cameraService.state.get('connected')) {
			this.props.fetchRecordings(this.props.cameraService);
		}
	}

	getPathForDate (date) {
		return `${this.props.match.urlWithoutOptionalParams}/${date.year()}/${date.month() + 1}/${date.date()}`; // Add 1 to month because moment months are zero-based. This just makes the url one-based.
	}

	goToDate (date) {
		// Update current URL to new selected date.
		this.props.history.replace(this.getPathForDate(date));
	}

	playRecording (recordingId) {
		this.props.history.replace(this.getPathForDate(this.props.selectedDate) + '/' + recordingId);
	}

	handleDateSelected (date) {
		this.goToDate(date);
	}

	handleCloseClick (event) {
		event.preventDefault();

		this.goToDate(this.props.selectedDate);
	}

	render () {
		let bottomContent;

		if (this.props.isLoading) {
			bottomContent = <p>Loading Recordings</p>;
		} else if (this.props.error) {
			bottomContent = <p>{this.props.error}</p>;
		} else if (this.props.selectedDateRecordings.length) {
			bottomContent = (
				<List
					title={this.props.selectedDate.format('MMMM Do')}
					isOrdered={true}
					shouldVirtualize={true}>
					{this.props.selectedDateRecordings.map((recording) => ({
						key: recording.id,
						label: () => moment(recording.date).format('h:mm A'),
						icon: playButtonIcon,
						meta: () => 'Movement for ' + moment.duration(recording.duration, 'seconds').humanize(),
						onClick: () => this.playRecording(recording.id)
					}))}
				</List>
			);
		} else {
			bottomContent = <p>No recordings were found for the selected date.</p>;
		}

		return (
			<NavigationScreen
				title={(this.props.cameraName || 'Camera') + ' Recordings'}
				url={this.props.match.urlWithoutOptionalParams}>
				<div styleName="screen">
					<div styleName={this.props.selectedRecording ? 'topRecordingSelected' : 'top'}>
						{this.props.selectedRecording
							? <div styleName="videoContainer">
								<AudioPlayer
									audioServiceId={this.props.cameraService.id}
									recording={this.props.selectedRecording}
									shouldShowControls={false}
									streamingToken={this.props.selectedRecording.audio_streaming_token}
									showControlsWhenStopped={false}
									onPlay={this.onStreamStart}
									onStop={this.onStreamStop}
									ref={this.audioPlayer}
									autoplay={true} />
								<VideoPlayer
									cameraServiceId={this.props.cameraService.id}
									recording={this.props.selectedRecording}
									key={this.props.selectedRecording.id}
									streamingToken={this.props.selectedRecording.streaming_token}
									width={this.props.selectedRecording.width}
									height={this.props.selectedRecording.height}
									autoplay={true} />
							</div>
							: <div styleName="datePickerContainer">
								<DatePicker
									selectedDate={this.props.selectedDate}
									enabledDates={this.props.getDatesOfRecordings(this.state.selectedMonth).map((date) => moment(date))}
									onSelect={this.handleDateSelected}
									onMonthChange={(selectedMonth) => this.setState({selectedMonth})} />
							</div>}
						{this.props.selectedRecording && <a href="#" styleName="closeButton" onClick={this.handleCloseClick}>Close</a>}
					</div>
					<div styleName={this.props.selectedRecording ? 'bottomRecordingSelected' : 'bottom'}>
						{bottomContent}
					</div>
				</div>
			</NavigationScreen>
		);
	}
}

CameraRecordingsScreen.propTypes = {
	cameraService: PropTypes.object,
	cameraName: PropTypes.string,
	selectedDate: PropTypes.object.isRequired,
	selectedDateRecordings: PropTypes.array,
	selectedRecording: PropTypes.object,
	match: PropTypes.object,
	history: PropTypes.object.isRequired,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func,
	getDatesOfRecordings: PropTypes.func,
	error: PropTypes.string
};

CameraRecordingsScreen.defaultProps = {
	selectedDateRecordings: []
};

const mapStateToProps = ({servicesList}, {match}) => {
		const cameraService = getServiceById(servicesList, match.params.cameraServiceId, false),
			recordingsError = cameraGetRecordingsListError(servicesList, match.params.cameraServiceId);

		let selectedDate = moment([
				match.params.year,
				match.params.month - 1, // Subtract 1 from month because Moment months are zero-based.
				match.params.date
			]),
			error;

		if (!selectedDate.isValid()) {
			selectedDate = moment();
		}

		if (!cameraService) {
			error = 'There was a problem loading the camera’s recordings.';
		} else if (!cameraService.state.get('connected')) {
			error = 'Recordings cannot be viewed when the camera is not connected.';
		} else if (recordingsError) {
			error = recordingsError;
		}

		return {
			error,
			cameraService,
			cameraName: getServiceNameById(servicesList, cameraService.id),
			selectedDate,
			selectedDateRecordings: cameraService && cameraGetRecordingsByDate(servicesList, cameraService.id, selectedDate),
			selectedRecording: cameraGetRecordingById(servicesList, cameraService.id, match.params.recordingId),
			isLoading: cameraIsRecordingsListLoading(servicesList, cameraService.id),
			getDatesOfRecordings: (month) => cameraGetDatesOfRecordings(servicesList, cameraService.id, month.format('YYYY-M')) || []
		};
	},
	mapDispatchToProps = (dispatch) => {
		return {
			fetchRecordings: (cameraService) => cameraService && cameraService.state.get('connected') && dispatch(cameraFetchRecordings(cameraService.id))
		};
	};

export default compose(
	withRoute({params: '/:cameraServiceId/:year?/:month?/:date?/:recordingId?'}),
	connect(mapStateToProps, mapDispatchToProps)
)(CameraRecordingsScreen);
