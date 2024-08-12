// HlsPlayer.js
import React from 'react';
import PropTypes from 'prop-types';
import Hls from '../../lib/hls/hls.js';
import fscreen from 'fscreen';
import styles from './VideoPlayer.css';

export class HlsPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isFullScreen: false,
			hasPlayedOnce: false,
			currentPlayLocation: 0,
			hlsSupported: true
			// isPlaying: this.props.autoplay,
			// shouldShowControls: this.props.showControlsWhenStopped || this.props.autoplay
		};

		this.element = React.createRef();

		this.hls = new Hls({
			liveDurationInfinity: this.props.live,
			startPosition: this.props.startPosition ? this.props.startPosition : -1,
			autoStartLoad: true
		});
	}

	componentDidMount () {
		fscreen.addEventListener('fullscreenchange', this.updateFullScreenState);

		// For autoplay, hide controls after delay.
		if (this.state.shouldShowControls) {
			// this.showHideControls();
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
		this.hls.detachMedia();
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
		console.log('!! HLSPlayer videoUrl !!', this.props.videoUrl);
		this.state.hlsSupported = false;
		if (Hls.isSupported()) {
			this.state.hlsSupported = true;
			this.setState(this.state);
			const video = document.getElementById(this.props.cameraServiceId);

			this.hls.attachMedia(video);
			this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				this.hls.loadSource(this.props.videoUrl);
			});
			this.hls.on(Hls.Events.MANIFEST_PARSED, () => this.props.autoPlay ? video.play() : video.stop());
		}

		this.setState(this.state);
	}

	getVideoUrl () {
		console.log('!! getVideoUrl videoUrl !!', this.props.videoUrl);
	}

	render () {
		return (
			<div>
				<video
					id={this.props.cameraServiceId}
					className={styles.hlsPlayer}
					controls="controls"
					src={this.state.hlsSupported ? '' : this.props.videoUrl}
					type="application/x-mpegURL" />
			</div>
		);
	}
}

HlsPlayer.propTypes = {
	// NOTE: The HlsPlayer component should always be called with a key
	// property set to the ID of the recording or camera that is being streamed.
	cameraServiceId: PropTypes.string,
	motionArea: PropTypes.object,
	firstLoad: PropTypes.bool,
	firstPointSet: PropTypes.bool,
	secondPointSet: PropTypes.bool,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	videoUrl: PropTypes.string,
	posterUrl: PropTypes.string,
	autoPlay: PropTypes.bool,
	live: PropTypes.bool,
	showControlsWhenStopped: PropTypes.bool,
	shouldShowControls: PropTypes.bool,
	width: PropTypes.number,
	height: PropTypes.number,
	startPosition: PropTypes.number,
	onPlay: PropTypes.func,
	onStop: PropTypes.func
};

HlsPlayer.defaultProps = {
	showControlsWhenStopped: true
};

export default HlsPlayer;
