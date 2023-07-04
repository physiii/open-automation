import React from 'react';
import PropTypes from 'prop-types';
import AudioStream from './AudioStream.js';
import fscreen from 'fscreen';
import styles from './AudioPlayer.css';

const controlsHideDelay = 3000;

export class AudioPlayer extends React.Component {
	constructor (props) {
		super(props);

		// Copying props to state here because we specifically only care about
		// the autoplay prop during the first render.
		this.state = {
			isPlaying: this.props.autoplay,
			isFullScreen: false,
			hasPlayedOnce: false,
			shouldShowControls: this.props.showControlsWhenStopped || this.props.autoplay
		};

		this.element = React.createRef();

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount () {
		fscreen.addEventListener('fullscreenchange', this.updateFullScreenState);

		// For autoplay, hide controls after delay.
		if (this.state.shouldShowControls) {
			this.showHideControls();
		}
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

	handleClick () {
		if (this.state.isPlaying) {
			this.stop();
		} else {
			this.play();
		}
	}

	showHideControls (forceShow) {
		this.setState({shouldShowControls: this.state.isPlaying || this.props.showControlsWhenStopped || this.state.isFullScreen || forceShow});

		clearTimeout(this.controlsTimeout);
		this.controlsTimeout = setTimeout(() => {
			this.setState({shouldShowControls: (!this.state.isPlaying && (this.props.showControlsWhenStopped || this.state.isFullScreen)) || false});
		}, controlsHideDelay);
	}

	play () {
		this.setState({
			isPlaying: true,
			hasPlayedOnce: true
		});

		this.showHideControls();
	}

	stop () {
		this.setState({
			isPlaying: false,
			shouldShowControls: this.props.showControlsWhenStopped || this.state.isFullScreen
		});
	}

	render () {
		return (
			<AudioStream
				className={styles.canvas}
				{...this.props}
				shouldStream={this.state.isPlaying}
				key={this.props.audioServiceId + '_audio'} />
		);
	}
}

AudioPlayer.propTypes = {
	// NOTE: The AudioPlayer component should always be called with a key
	// property set to the ID of the recording or audio that is being streamed.
	audioServiceId: PropTypes.string.isRequired,
	motionArea: PropTypes.object,
	firstLoad: PropTypes.bool,
	firstPointSet: PropTypes.bool,
	secondPointSet: PropTypes.bool,
	recording: PropTypes.object,
	streamingToken: PropTypes.string,
	posterUrl: PropTypes.string,
	autoplay: PropTypes.bool,
	showControlsWhenStopped: PropTypes.bool,
	shouldShowControls: PropTypes.bool,
	onPlay: PropTypes.func,
	onStop: PropTypes.func
};

AudioPlayer.defaultProps = {
	showControlsWhenStopped: true
};

export default AudioPlayer;
