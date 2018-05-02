import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {deviceById} from '../../state/ducks/devices-list/selectors.js';
import {fetchCameraRecordings} from '../../state/ducks/devices-list/operations.js';

export class CameraRecordings extends React.Component {
	componentDidMount () {
		this.props.getRecordings(this.props.camera);
	}

	render () {
		let recordings;

		if (!this.props.isLoading && !(this.props.recordings instanceof Array)) {

			// Group by year
			recordings = this.props.recordings.groupBy((recording) => new Date(recording.date).getFullYear());

			// Group by month
			recordings.forEach((year, key) => {
				recordings = recordings.set(
					key,
					year.groupBy((recording) => new Date(recording.date).getMonth())
				);
			});

			// Group by day
			recordings.forEach((year, yearKey) => {
				year.forEach((month, monthKey) => {
					recordings = recordings.setIn(
						[
							yearKey,
							monthKey
						],
						month.groupBy((recording) => new Date(recording.date).getDate())
					);
				});
			});

			recordings = recordings.toOrderedMap();
		}

		return (
			<div>
				<Button to={this.props.parentPath}>Back</Button>
				{this.props.isLoading
					? <div>Loading Recordings</div>
					: <ol>
						{recordings
							? recordings.keySeq().map((year) => <li key={year}>{year}</li>)
							: 'no recordings'
						}
						{/*recordings.map((recording, index) => (
							<li key={index}>{moment(recording.date).format('MMMM D YYYY, h:mm:ss a')}</li>
						))*/}
					</ol>
				}
			</div>
		);
	}
}

CameraRecordings.propTypes = {
	camera: PropTypes.object, // TODO: Immutable Record proptype (also allow object)
	recordings: PropTypes.object, // TODO: Immutable List proptype (also allow array)
	getRecordings: PropTypes.func,
	isLoading: PropTypes.bool,
	parentPath: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
		const camera = deviceById(ownProps.cameraId, state.devicesList);

		return {
			camera,
			recordings: camera.recordingsList.recordings || [],
			isLoading: camera.recordingsList.loading
		};
	},
	mapDispatchToProps = (dispatch) => {
		return {
			getRecordings: (camera) => dispatch(fetchCameraRecordings(camera))
		};
	};

export default connect(mapStateToProps, mapDispatchToProps)(CameraRecordings);
