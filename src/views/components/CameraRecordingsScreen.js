// CameraRecordingsScreen.js
import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SliderControl from './SliderControl.js';
import DatePicker from './DatePicker.js';
import VideoPlayer from './VideoPlayer.js';
import AudioPlayer from './AudioPlayer.js';
import PlayButtonIcon from '../icons/PlayButtonIcon.js';
import DownloadIcon from '../icons/DownloadIcon.js';
import List from './List.js';
import HlsPlayer from './HlsPlayer.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById, getServiceNameById, cameraGetRecordingsByDate, cameraGetRecordingById, cameraGetDatesOfRecordings, cameraIsRecordingsListLoading, cameraGetRecordingsListError} from '../../state/ducks/services-list/selectors.js';
import {cameraFetchRecordings, doServiceAction} from '../../state/ducks/services-list/operations.js';
import styles from './CameraRecordingsScreen.css';

const playButtonIcon = <PlayButtonIcon size={24} />,
	downloadIcon = <DownloadIcon size={24} />;

export class CameraRecordingsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleDateSelected = this.handleDateSelected.bind(this);
		this.handleCloseClick = this.handleCloseClick.bind(this);

		this.state = {
			selectedMonth: this.props.selectedDate.startOf('month'),
			currentPlayLocation: 0,
			showRecording: false
		};

		this.videoPlayer = React.createRef();
	}

	componentDidMount () {
		this.props.fetchRecordings(this.props.service);
	}

	componentDidUpdate (previousProps) {
		if (this.props.service.state.get('connected') && !previousProps.service.state.get('connected')) {
			this.props.fetchRecordings(this.props.service);
		}
	}

	getPathForDate (date) {
		// Add 1 to month because moment months are zero-based. This just makes the url one-based.
		return `${this.props.match.urlWithoutOptionalParams}/${date.year()}/${date.month() + 1}/${date.date()}`;
	}

	goToDate (date) {
		// Update current URL to new selected date.
		this.props.history.replace(this.getPathForDate(date));
	}

	playRecording (recording) {
		console.log('playRecording', recording);
		let recordingId = recording.id

		this.setState({showRecording: false}, () => {
			this.setState({showRecording: true});
		});

		this.props.history.replace(this.getPathForDate(this.props.selectedDate) + '/' + recordingId);

		console.log('playRecording');
	}

	handleDateSelected (date) {
		this.goToDate(date);
	}

	handleCloseClick (event) {
		event.preventDefault();

		this.setState({showRecording: false});
		this.goToDate(this.props.selectedDate);
	}

	getVideoUrlRel () {
		if (!this.props.selectedRecording) return;

		const	url = '/hls/video_recording?'
			+ 'recording_id=' + this.props.selectedRecording.id;

		return url;
	}

	transportVideo (time) {
		this.setState({currentPlayLocation: time});
		this.props.doAction(this.props.service.id, {
			property: 'setCurrentPlayLocation',
			value: time
		});
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
						secondaryLink: '/service-content/' + moment(recording.date).format('LLLL') + '.avi?service_id=' + this.props.service.id + '&recordingId=' + recording.id,
						secondaryIcon: downloadIcon,
						meta: () => 'Movement for ' + moment.duration(recording.duration, 'seconds').humanize(),
						onClick: (event) => this.playRecording(recording, event)
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
				<div className={styles.screen}>
					<div className={this.props.selectedRecording ? styles.topRecordingSelected : styles.top}>
						{this.state.showRecording
							? this.props.selectedRecording.file.endsWith('.m3u8')
								? <div>
									<div className={styles.videoContainer}>
										<HlsPlayer
											cameraServiceId={this.props.service.id}
											live={false}
											videoUrl={this.getVideoUrlRel()}
											autoPlay={true}
											startPosition={-100}
											ref={this.videoPlayer} />
									</div>
								  </div>
								: <div>
									<div className={styles.videoContainer}>
										<video
											src={this.getVideoUrlRel()}
											controls
											autoPlay={true}>
										</video>
									</div>
								  </div>
							: null
						}
							: <div className={styles.datePickerContainer}>
								<DatePicker
									selectedDate={this.props.selectedDate}
									enabledDates={this.props.getDatesOfRecordings(this.state.selectedMonth).map((date) => moment(date))}
									onSelect={this.handleDateSelected}
									onMonthChange={(selectedMonth) => this.setState({selectedMonth})} />
							</div>}
						{this.state.showRecording && <a href="#" className={styles.closeButton} onClick={this.handleCloseClick}>Close</a>}
					</div>
					<div className={this.props.selectedRecording ? styles.bottomRecordingSelected : styles.bottom}>
						{bottomContent}
					</div>
				</div>
			</NavigationScreen>
		);
	}
}

CameraRecordingsScreen.propTypes = {
	videoLength: PropTypes.number,
	service: PropTypes.object,
	cameraName: PropTypes.string,
	selectedDate: PropTypes.object.isRequired,
	selectedDateRecordings: PropTypes.array,
	selectedRecording: PropTypes.object,
	match: PropTypes.object,
	history: PropTypes.object.isRequired,
	isLoading: PropTypes.bool,
	fetchRecordings: PropTypes.func,
	getDatesOfRecordings: PropTypes.func,
	error: PropTypes.string,
	doAction: PropTypes.func
};

CameraRecordingsScreen.defaultProps = {
	selectedDateRecordings: []
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.cameraServiceId, false),
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

		if (!service) {
			error = 'There was a problem loading the camera’s recordings.';
		} else if (!service.state.get('connected')) {
			error = 'Recordings cannot be viewed when the camera is not connected.';
		} else if (recordingsError) {
			error = recordingsError;
		}

		return {
			error,
			service,
			cameraName: getServiceNameById(servicesList, service.id),
			selectedDate,
			selectedDateRecordings: service && cameraGetRecordingsByDate(servicesList, service.id, selectedDate),
			selectedRecording: cameraGetRecordingById(servicesList, service.id, match.params.recordingId),
			isLoading: cameraIsRecordingsListLoading(servicesList, service.id),
			getDatesOfRecordings: (month) => cameraGetDatesOfRecordings(servicesList, service.id, month.format('YYYY-M')) || []
		};
	},
	mapDispatchToProps = (dispatch) => {
		return {
			doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
			fetchRecordings: (service) => service && service.state.get('connected') && dispatch(cameraFetchRecordings(service.id))
		};
	};

export default compose(
	withRoute({params: '/:cameraServiceId/:year?/:month?/:date?/:recordingId?'}),
	connect(mapStateToProps, mapDispatchToProps)
)(CameraRecordingsScreen);
