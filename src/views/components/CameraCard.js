import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ServiceCardBase from './ServiceCardBase.js';
import ServiceIcon from '../icons/ServiceIcon.js';
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
		const lastRecordingDate = this.props.service.state.motion_detected_date;

		return (
			<ServiceCardBase
				service={this.props.service}
				name={this.props.service.settings.name || 'Camera'}
				status={lastRecordingDate && 'Movement detected ' + moment(lastRecordingDate).fromNow()}
				icon={<ServiceIcon service={this.props.service} size={40} />}
				isConnected={this.props.service.state.connected}
				onCardClick={this.onCardClick}
				toolbarsOverlayContent={true}
				secondaryAction={<Button to={`${this.props.parentPath}/recordings/${this.props.service.id}`}>View Recordings</Button>}
				hideToolbars={this.state.isStreaming}
				{...this.props}>
				<VideoPlayer
					key={this.props.service.id}
					cameraServiceId={this.props.service.id}
					streamingToken={this.props.service.streaming_token}
					posterUrl={this.props.service.state.preview_image && 'data:image/jpg;base64,' + this.props.service.state.preview_image}
					showControlsWhenStopped={false}
					width={this.props.service.settings.resolution_w}
					height={this.props.service.settings.resolution_h}
					onPlay={this.onStreamStart}
					onStop={this.onStreamStop}
					ref={this.videoPlayer} />
			</ServiceCardBase>
		);
	}
}

CameraCard.propTypes = {
	service: PropTypes.object,
	parentPath: PropTypes.string
};

export default CameraCard;
