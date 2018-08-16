import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ServiceCardBase from './ServiceCardBase.js';
import CameraIcon from '../icons/CameraIcon.js';
import Button from './Button.js';
import VideoPlayer from './VideoPlayer.js';

export class CameraCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			isStreaming: false
		};

		this.videoPlayer = React.createRef();

		this.onStreamStart = this.onStreamStart.bind(this);
		this.onStreamStop = this.onStreamStop.bind(this);
		this.onCardClick = this.onCardClick.bind(this);
	}

	onStreamStart () {
		this.setState({isStreaming: true});
	}

	onStreamStop () {
		this.setState({isStreaming: false});
	}

	onCardClick () {
		if (this.state.isStreaming) {
			this.videoPlayer.current.stop();
		} else {
			this.videoPlayer.current.play();
		}
	}

	render () {
		const lastRecordingDate = this.props.camera.state.last_recording_date;

		return (
			<ServiceCardBase
				name={this.props.camera.settings.name || 'Camera'}
				status={lastRecordingDate && 'Movement recorded ' + moment(lastRecordingDate).fromNow()}
				icon={<CameraIcon size={40} />}
				isConnected={this.props.camera.state.connected}
				onCardClick={this.onCardClick}
				content={<VideoPlayer
					key={this.props.camera.id}
					cameraServiceId={this.props.camera.id}
					streamingToken={this.props.camera.streaming_token}
					posterUrl={this.props.camera.state.preview_image && 'data:image/jpg;base64,' + this.props.camera.state.preview_image}
					showControlsWhenStopped={false}
					width={this.props.camera.settings.resolution_w}
					height={this.props.camera.settings.resolution_h}
					onPlay={this.onStreamStart}
					onStop={this.onStreamStop}
					ref={this.videoPlayer} />}
				toolbarsOverlayContent={true}
				secondaryAction={<Button to={`${this.props.parentPath}/recordings/${this.props.camera.id}`}>View Recordings</Button>}
				hideToolbars={this.state.isStreaming} />
		);
	}
}

CameraCard.propTypes = {
	camera: PropTypes.object,
	parentPath: PropTypes.string
};

export default CameraCard;
