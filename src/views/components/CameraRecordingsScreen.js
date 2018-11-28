import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import List from './List.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {compose} from 'redux';
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
			<NavigationScreen
				title={(this.props.cameraName || 'Camera') + ' Recordings'}
				url={this.props.match.urlWithoutOptionalParams}>
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
			</NavigationScreen>
		);
	}
}

CameraRecordingsScreen.propTypes = {
	cameraServiceId: PropTypes.string,
	cameraName: PropTypes.string,
	selectedDate: PropTypes.object.isRequired,
	allRecordings: PropTypes.array,
	selectedDateRecordings: PropTypes.array,
	selectedRecording: PropTypes.object,
	match: PropTypes.object,
	history: PropTypes.object.isRequired,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func,
	error: PropTypes.string
};

CameraRecordingsScreen.defaultProps = {
	allRecordings: [],
	selectedDateRecordings: [],
	fetchRecordings: () => { /* no-op */ }
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
	mergeProps = ({servicesList, cameraService, ...stateProps}, {dispatch, ...dispatchProps}, ownProps) => {
		let selectedDate = moment([
			ownProps.match.params.year,
			ownProps.match.params.month - 1, // Subtract 1 from month because moment months are zero-based.
			ownProps.match.params.date
		]);

		if (!selectedDate.isValid()) {
			selectedDate = moment();
		}

		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			selectedDate,
			selectedDateRecordings: cameraService && cameraGetRecordingsByDate(servicesList, cameraService.id, selectedDate),
			fetchRecordings: () => cameraService && cameraService.state.connected && dispatch(cameraFetchRecordings(cameraService.id))
		};
	};

export default compose(
	withRoute({params: '/:cameraServiceId/:year?/:month?/:date?/:recordingId?'}),
	connect(mapStateToProps, null, mergeProps)
)(CameraRecordingsScreen);
