import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import VideoPlayer from './VideoPlayer.js';
import AudioPlayer from './AudioPlayer.js';

export class CameraCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			isStreaming: false
		};

		this.videoPlayer = React.createRef();
		this.audioPlayer = React.createRef();

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
			this.audioPlayer.current.stop();
		} else {
			this.videoPlayer.current.play();
			this.audioPlayer.current.play();
		}
	}

	render () {
		const motionDetectedDate = this.props.service.state.get('motion_detected_date');

		return (
			<ServiceCardBase
				service={this.props.service}
				name={this.props.service.settings.get('name') || 'Camera'}
				status={motionDetectedDate && 'Movement detected ' + moment(motionDetectedDate).fromNow()}
				isConnected={this.props.service.state.get('connected')}
				onCardClick={this.onCardClick}
				toolbarsOverlayContent={true}
				secondaryAction={<Button to={`${this.props.match.url}/recordings/${this.props.service.id}`}>View Recordings</Button>}
				hideToolbars={this.state.isStreaming}
				{...this.props}>
				<AudioPlayer
					audioServiceId={this.props.service.id}
					shouldShowControls={false}
					streamingToken={this.props.service.streaming_token}
					showControlsWhenStopped={false}
					onPlay={this.onStreamStart}
					onStop={this.onStreamStop}
					ref={this.audioPlayer} />
				<VideoPlayer
					key={this.props.service.id}
					cameraServiceId={this.props.service.id}
					shouldShowControls={true}
					streamingToken={this.props.service.streaming_token}
					posterUrl={'/service-content/camera-preview?service_id=' + this.props.service.id + '&date=' + motionDetectedDate}
					showControlsWhenStopped={false}
					width={this.props.service.settings.get('resolution_w')}
					height={this.props.service.settings.get('resolution_h')}
					onPlay={this.onStreamStart}
					onStop={this.onStreamStop}
					ref={this.videoPlayer} />
			</ServiceCardBase>
		);
	}
}

CameraCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(CameraCard);
