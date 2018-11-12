import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import List from './List.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {getServiceById, getServiceNameById, cameraGetRecordings, cameraGetRecordingsByDate, cameraGetRecordingById, cameraIsRecordingsListLoading} from '../../state/ducks/services-list/selectors.js';
import {cameraFetchRecordings} from '../../state/ducks/services-list/operations.js';
import './CameraRecordingsScreen.css';

const playButtonIcon = <PlayButtonIcon size={24} />;

export class CameraRecordingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.goToDate = this.goToDate.bind(this);
	}

	componentDidMount () {
		this.props.fetchRecordings();
		this.updateNavigation();
	}

	componentDidUpdate () {
		this.updateNavigation();
	}

	updateNavigation () {
		this.props.setScreenTitle((this.props.cameraName || 'Camera') + ' Recordings');
	}

	getPathForDate (date) {
		return `${this.props.basePath}/${this.props.cameraServiceId}/${date.year()}/${date.month() + 1}/${date.date()}`; // Add 1 to month because moment months are zero-based. This just makes the url one-based.
	}

	goToDate (date) {
		// Update current URL to new selected date.
		this.props.history.replace(this.getPathForDate(date));
	}

	playRecording (recordingId) {
		this.props.history.replace(this.getPathForDate(this.props.selectedDate) + '/' + recordingId);
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
					isOrdered={true}>
					{this.props.selectedDateRecordings.map((recording) => ({
						key: recording.id,
						label: moment(recording.date).format('h:mm A'),
						icon: playButtonIcon,
						meta: 'Movement for ' + moment.duration(recording.duration, 'seconds').humanize(),
						onClick: () => this.playRecording(recording.id)
					}))}
				</List>
			);
		} else {
			bottomContent = <p>No recordings were found for the selected date.</p>;
		}

		return (
			<div styleName="screen">
				<div styleName={this.props.selectedRecording ? 'topRecordingSelected' : 'top'}>
					{this.props.selectedRecording
						? <div styleName="videoContainer">
							<VideoPlayer
								cameraServiceId={this.props.cameraServiceId}
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
								events={this.props.allRecordings}
								onSelect={this.goToDate} />
						</div>}
					{this.props.selectedRecording &&
						<a href="#" styleName="closeButton" onClick={(event) => {
							event.preventDefault();
							this.goToDate(this.props.selectedDate);
						}}>
							Close
						</a>}
				</div>
				<div styleName={this.props.selectedRecording ? 'bottomRecordingSelected' : 'bottom'}>
					{bottomContent}
				</div>
			</div>
		);
	}
}

CameraRecordingsScreen.routeParams = '/:cameraServiceId/:year?/:month?/:date?/:recordingId?';

CameraRecordingsScreen.propTypes = {
	cameraServiceId: PropTypes.string,
	cameraName: PropTypes.string,
	selectedDate: PropTypes.object.isRequired,
	allRecordings: PropTypes.array,
	selectedDateRecordings: PropTypes.array,
	selectedRecording: PropTypes.object,
	basePath: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func,
	setScreenTitle: PropTypes.func,
	error: PropTypes.string
};

CameraRecordingsScreen.defaultProps = {
	allRecordings: [],
	selectedDateRecordings: [],
	fetchRecordings: () => { /* no-op */ },
	setScreenTitle: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const cameraService = getServiceById(servicesList, match.params.cameraServiceId);

		if (!cameraService) {
			return {error: 'There was a problem loading the camera’s recordings.'};
		}

		if (!cameraService.state.connected) {
			return {error: 'Recordings cannot be viewed when the camera is not connected.'};
		}

		return {
			servicesList,
			cameraService,
			cameraServiceId: cameraService.id,
			cameraName: getServiceNameById(servicesList, cameraService.id),
			allRecordings: cameraGetRecordings(servicesList, cameraService.id),
			selectedRecording: cameraGetRecordingById(servicesList, cameraService.id, match.params.recordingId),
			isLoading: cameraIsRecordingsListLoading(servicesList, cameraService.id)
		};
	},
	mergeProps = ({servicesList, cameraService, ...stateProps}, {dispatch, ...dispatchProps}, {match, ...ownProps}) => {
		let selectedDate = moment([
			match.params.year,
			match.params.month - 1, // Subtract 1 from month because moment months are zero-based.
			match.params.date
		]);

		if (!selectedDate.isValid()) {
			selectedDate = moment();
		}

		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			basePath: match.path.replace(CameraRecordingsScreen.routeParams, ''),
			selectedDate,
			selectedDateRecordings: cameraService && cameraGetRecordingsByDate(servicesList, cameraService.id, selectedDate),
			fetchRecordings: () => cameraService && cameraService.state.connected && dispatch(cameraFetchRecordings(cameraService.id))
		};
	};

export default connect(mapStateToProps, null, mergeProps)(CameraRecordingsScreen);
