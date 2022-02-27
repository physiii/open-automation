import React from 'react';
import PropTypes from 'prop-types';
import Hls from '../../lib/hls/hls.js';
import fscreen from 'fscreen';
import './VideoPlayer.css';

export class HlsPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isPlaying: this.props.autoplay,
			isFullScreen: false,
			hasPlayedOnce: false,
			currentPlayLocation: 0,
			shouldShowControls: this.props.showControlsWhenStopped || this.props.autoplay
		};

		this.element = React.createRef();

		this.hls = new Hls({
			enableWorker: false,
			autoPlay: false,
			maxStarvationDelay: 60,
			maxLoadingDelay: 60
		});
	}

	componentDidMount () {
		fscreen.addEventListener('fullscreenchange', this.updateFullScreenState);

		// For autoplay, hide controls after delay.
		if (this.state.shouldShowControls) {
			this.showHideControls();
		}
		this.bootstrapPlayer();
	}

	componentDidUpdate (previousProps, previousState) {
		if (!previousState.isPlaying && this.state.isPlaying && typeof this.props.onPlay === 'function') {
			this.props.onPlay();
		} else if (previousState.isPlaying && !this.state.isPlaying && typeof this.props.onStop === 'function') {
			this.props.onStop();
		}

		if (!previousState.isFullScreen && this.state.isFullScreen) {
			this.enterFullScreen();
		} else if (previousState.isFullScreen && !this.state.isFullScreen) {
			this.exitFullScreen();
		}
	}

	componentWillUnmount () {
		fscreen.removeEventListener('fullscreenchange', this.updateFullScreenState);
		clearTimeout(this.controlsTimeout);
	}

	getVideoWidth () {
		if (this.element) {
			if (this.element.current) {
				return this.element.current.clientWidth;
			}
		}

		return 0;
	}

	getVideoHeight () {
		if (this.element) {
			if (this.element.current) {
				return this.element.current.clientHeight;
			}
		}

		return 0;
	}

	getAspectRatioPaddingTop () {
		const aspectRatio = this.props.height / this.props.width;

		return (aspectRatio * 100) + '%';
	}

	bootstrapPlayer () {
		if (Hls.isSupported()) {
			const video = document.getElementById(this.props.cameraServiceId);

			this.hls.attachMedia(video);
			this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				this.hls.loadSource('/hls/video?stream_id=' + this.props.cameraServiceId);
			});
			this.hls.on(Hls.Events.MANIFEST_PARSED, () => video.stop());
		}
	}

	render () {
		return (
			<div>
				<video
					id={this.props.cameraServiceId}
					styleName="hlsPlayer"
					autoPlay="true"
					controls="controls"
					type="application/x-mpegURL" />
			</div>
		);
	}
}

HlsPlayer.propTypes = {
	// NOTE: The HlsPlayer component should always be called with a key
	// property set to the ID of the recording or camera that is being streamed.
	cameraServiceId: PropTypes.string.isRequired,
	motionArea: PropTypes.object,
	firstLoad: PropTypes.bool,
	firstPointSet: PropTypes.bool,
	secondPointSet: PropTypes.bool,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	videoUrl: PropTypes.string,
	posterUrl: PropTypes.string,
	autoplay: PropTypes.bool,
	showControlsWhenStopped: PropTypes.bool,
	shouldShowControls: PropTypes.bool,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	onPlay: PropTypes.func,
	onStop: PropTypes.func
};

HlsPlayer.defaultProps = {
	showControlsWhenStopped: true
};

export default HlsPlayer;
