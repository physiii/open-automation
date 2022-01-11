import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {cameraStartStream, cameraStopStream, cameraStartRecordingStream, cameraStopRecordingStream} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import HlsPlayer from './HlsPlayer.js';
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

		console.log('network_path', this.props.service.settings.get('network_path'));

		if (this.props.service.settings.get('network_path') != '') this.props.cameraStartStream();
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

		this.setState({isStreaming: !this.state.isStreaming});
		console.log("onCardClick", this.state.isStreaming);
	}

	getVideoUrl () {
		// 'http://192.168.1.42:5050/hls/video?stream_id=abc123&token_id=tkn123'
		let	url = window.location.protocol + '//' + window.location.hostname +  ':' + window.location.port + '/'
			+ 'hls/video?'
			+ 'stream_id=' + this.props.service.id
			+ '&stream_token=' + this.props.service.streaming_token;

		return url;
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
				{ this.props.service.settings.get('network_path') == '' ?
					<div>
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
					</div> : '' }
					{ this.props.service.settings.get('network_path') != '' && this.props.service.streaming_token != null ?
					<HlsPlayer
						key={this.props.service.id}
						cameraServiceId={this.props.service.id}
						shouldShowControls={true}
						streamingToken={this.props.service.streaming_token}
						posterUrl={'/service-content/camera-preview?service_id=' + this.props.service.id + '&date=' + motionDetectedDate}
						videoUrl={this.getVideoUrl()}
						showControlsWhenStopped={false}
						width={this.props.service.settings.get('resolution_w')}
						height={this.props.service.settings.get('resolution_h')}
						onPlay={this.onStreamStart}
						onStop={this.onStreamStop}
						ref={this.videoPlayer} /> : '' }
			</ServiceCardBase>
		);
	}
}

CameraCard.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object,
	startStreaming: PropTypes.func,
	stopStreaming: PropTypes.func
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	cameraStartStream: () => dispatch(cameraStartStream(ownProps.service.id)),
	cameraStopStream: () => dispatch(cameraStopStream(ownProps.service.id)),
});

export default compose(
	connect(null, null, mapDispatchToProps),
	withRouter
)(CameraCard);
